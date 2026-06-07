# Engineering Guidelines — Aura eCommerce Platform

> **Audience:** The autonomous AI agents (Backend Agent, Frontend Agent, Orchestration Agent) responsible for generating and maintaining the Aura codebase.
> **Purpose:** A single, authoritative rule set that guarantees every line of generated code is consistent, type-safe, secure, and production-grade — regardless of which agent produced it.

These guidelines are **binding constraints**, not suggestions. An agent MUST treat a violation of any rule below as a build-breaking defect and self-correct before handing work back to the Orchestration Agent.

---

## 1. Language Preference — TypeScript First, Always

| Layer | Language | Compiler Mode |
| --- | --- | --- |
| Backend (`/src`) | TypeScript 5.5 (Node.js ≥ 20, Express 4) | `strict: true` |
| Frontend (`/frontend`) | TypeScript 5.5 (React 18 + Vite 5) | `strict: true` |

**Rules**

- **No JavaScript source files.** Every runtime module is authored in `.ts` / `.tsx`. Plain `.js` is permitted only for build tooling configuration (`postcss.config.js`, `tailwind.config.js`).
- **No `any` as an escape hatch.** When a value's shape is genuinely unknown (e.g. a decoded JWT, a thrown error), type it as `unknown` and **narrow it explicitly** before use. The JWT verifier and the global error handler both demonstrate this pattern (`decoded as unknown` → runtime shape check → safe cast).
- **Explicit return types** on every exported function, service method, and repository method. This makes the contract self-documenting and prevents accidental inference drift across agents.
- **Shared types live in `types/index.ts`** (one per package). Domain entities (`User`, `Product`, `Order`, `OrderItem`, `AuthPayload`) are defined once and imported everywhere. Agents never redeclare a domain shape locally.
- **`import type { ... }`** is used for type-only imports to keep the emitted bundle clean.

---

## 2. Architectural Design Pattern — Controller → Service → Repository

The backend follows a strict three-tier **Controller–Service–Repository (CSR)** separation. Each layer has exactly one responsibility and may only call *downward*.

```
HTTP Request
    │
    ▼
┌─────────────┐   parse & validate input, shape HTTP response
│ Controller  │   (thin; no business logic, no SQL)
└──────┬──────┘
       ▼
┌─────────────┐   business rules, orchestration, invariants
│  Service    │   (e.g. checkout totals, stock conflicts)
└──────┬──────┘
       ▼
┌─────────────┐   SQL only; owns the database boundary
│ Repository  │   (parameterized queries, transactions)
└──────┬──────┘
       ▼
   MySQL (mysql2/promise pool)
```

**Layer contracts**

- **Controllers** (`*.controller.ts`)
  - Read `req`, call exactly one service method, write the JSON envelope `{ success, data }`.
  - Wrapped in `asyncHandler` so rejected promises flow to the central error handler.
  - Contain **zero** SQL and **zero** business decisions.
- **Services** (`*.service.ts`)
  - Hold all business logic and invariants: cart-empty checks, total computation, stock-conflict translation, "order created but not loadable" guards.
  - Throw domain errors via `AppError` (e.g. `AppError.badRequest`, `AppError.conflict`).
  - Orchestrate **multiple** repositories when needed (e.g. `orderService.checkout` reads `cartRepository` then writes through `orderRepository`).
- **Repositories** (`*.repository.ts`)
  - The **only** layer permitted to touch the database.
  - Every query is parameterized (`?` placeholders) — never string-concatenated. This is a hard OWASP A03 (Injection) requirement.
  - Multi-statement invariants run inside `withTransaction(...)` so they are atomic (the checkout flow inserts the order, inserts line items, decrements stock with an oversell guard, and clears the cart in one transaction).
- **Routes** (`*.routes.ts`) wire HTTP verbs + paths to controller handlers, attaching `authenticate` and `validate(schema)` middleware where required. A single `routes/index.ts` aggregates them under `/api`.

---

## 3. Folder Architecture

The repository is a **monorepo** with an independently deployable backend and frontend.

```
aura/
├── docker-compose.yml        # MySQL 8 + API orchestration
├── Dockerfile                # Multi-stage backend image
├── package.json              # Backend (aura-backend)
├── tsconfig.json
├── src/                      # ── BACKEND (Express + TypeScript) ──
│   ├── app.ts                # Express app composition (helmet, cors, routes, error handler)
│   ├── server.ts             # Bootstrap: DB init + listen
│   ├── config/               # env parsing, MySQL pool, init.sql schema
│   ├── controllers/          # HTTP boundary (thin)
│   ├── services/             # Business logic
│   ├── repositories/         # SQL / data access
│   ├── routes/               # Express routers + index aggregator
│   ├── middleware/           # authenticate, validate, errorHandler
│   ├── types/                # Shared domain + express augmentation
│   └── utils/                # AppError, asyncHandler, jwt
└── frontend/                 # ── FRONTEND (React + Vite + Tailwind) ──
    ├── index.html
    ├── tailwind.config.js
    ├── vite.config.ts
    └── src/
        ├── api/              # Typed HTTP clients (axios) per domain
        ├── components/       # ui/, layout/, feature components
        ├── context/          # AuthContext, CartContext (global state)
        ├── data/             # Static catalog seed
        ├── lib/              # motion presets, utils (clsx)
        └── types/            # Shared frontend domain types
```

**Rules**

- Backend mirrors the CSR layers as **sibling folders** — one file per domain (`auth`, `product`, `cart`, `order`) inside each layer.
- Frontend groups by **technical role** (`api`, `components`, `context`, `lib`, `types`), with `components/ui` for primitives and `components/layout` for chrome.
- The `@/` path alias maps to `frontend/src` so imports stay absolute and refactor-safe.

---

## 4. Naming Conventions

| Element | Convention | Example |
| --- | --- | --- |
| Variables, functions, methods | `camelCase` | `signToken`, `totalAmount`, `findDetailedByUser` |
| React components & TS types/interfaces | `PascalCase` | `CartDrawer`, `AuthPayload`, `OrderWithItems` |
| React component files | `PascalCase.tsx` | `Navbar.tsx`, `ProtectedRoute.tsx` |
| Backend module files | `dot.case` by layer | `order.service.ts`, `cart.repository.ts` |
| Constants / env keys | `UPPER_SNAKE_CASE` | `JWT_SECRET`, `DB_CONNECTION_LIMIT` |
| **Database** tables, columns | `snake_case` | `order_items`, `total_amount`, `user_id`, `created_at` |
| API JSON (response envelope) | `camelCase` keys for app data | `{ success, data, token }` |

**The camelCase ↔ snake_case boundary**

- **Application code is `camelCase`. The database is `snake_case`.**
- The **repository layer is the translation seam.** Raw SQL rows arrive as `snake_case` (`product_id`, `line_total`); services and controllers map them into `camelCase` domain inputs (`productId`, `unitPrice`) before the value leaves the data layer.
- Agents must never leak a `snake_case` DB column name into a service signature or an HTTP response field that represents app-level data.

---

## 5. Global Error Handling

Error handling is **centralized**, not scattered. No controller writes its own `catch`/500.

**Mechanism**

1. **`AppError`** (`utils/AppError.ts`) — a typed, operational error class with named factories (`badRequest`, `unauthorized`, `notFound`, `conflict`, `internal`) carrying an HTTP `statusCode` and optional `details`.
2. **`asyncHandler`** (`utils/asyncHandler.ts`) — wraps every async controller so a rejected promise is forwarded to Express's error pipeline instead of crashing the process.
3. **`notFoundHandler`** — converts any unmatched route into a 404 `AppError`.
4. **`errorHandler`** — the single terminal middleware (registered **last**, after routes) that:
   - Maps `AppError` → its `statusCode` + `message` + `details`.
   - Maps any other `Error` → `500`.
   - **Logs only 5xx** (non-operational) errors to the server console.
   - **Redacts internals in production**: when `NODE_ENV=production` and status ≥ 500, the client receives a generic `"Internal server error"` with no stack or details (OWASP A09 — no information leakage).
   - Always returns the consistent envelope: `{ success: false, error: { message, details? } }`.

**Agent rule:** business code throws `AppError`; it never calls `res.status(500)` directly. Translating an infrastructure failure into a domain error (e.g. the `INSUFFICIENT_STOCK:` sentinel → `AppError.conflict`) happens in the **service**, not the controller.

---

## 6. JWT Authentication & Token Handling

**Issuance (`utils/jwt.ts`)**

- `signToken(payload: AuthPayload)` signs with `env.jwt.secret` and `env.jwt.expiresIn` (default `7d`).
- The payload is minimal and non-sensitive: `{ sub: <userId>, email }`. **Passwords are never placed in a token.**
- Passwords are hashed with `bcryptjs` before storage; the hash never leaves the repository layer.

**Verification (`middleware/auth.ts` + `utils/jwt.ts`)**

- `authenticate` requires an `Authorization: Bearer <token>` header; missing/empty tokens raise `AppError.unauthorized`.
- `verifyToken` validates the signature **and** structurally narrows the decoded payload (`sub` is a number, `email` is a string) before casting. Any failure throws a generic `401 "Invalid or expired token"` — error messages never reveal *why* a token failed.
- On success the decoded identity is attached to `req.user` (typed via `types/express.d.ts` augmentation) and consumed by services as `userId`.

**Frontend handling**

- The token is persisted via `setStoredToken` / `getStoredToken` and attached to outbound requests by the shared axios client.
- `AuthContext` rehydrates the session on load by calling `/auth/me`; an invalid/expired token is **cleared silently** and the user is treated as logged out.
- `ProtectedRoute` gates authenticated views; unauthenticated users are redirected rather than shown a partial UI.

**Security baseline (applies to all agents)**

- Parameterized SQL everywhere (A03). `helmet` security headers + disabled `x-powered-by` (A05). Body-size limits (`100kb`) to blunt large-payload abuse. CORS restricted to a configured origin list. Secrets read exclusively from `env` — never hard-coded.
