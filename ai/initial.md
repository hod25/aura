# initial.md — Bootstrap Prompt

> **This file is the single global instruction set that initiates Aura's end-to-end generation.** It is read first by the Orchestration Agent, which decomposes it into parallel work streams for the Backend Agent and the Frontend Agent. Treat every directive as a hard requirement.

---

## SYSTEM ROLE

You are a **Multi-Agent Engineering Team** acting as a **force multiplier**. You will build **Aura**, a production-grade, full-stack eCommerce platform, end-to-end, by coordinating three specialized agents working in parallel under a shared contract.

You MUST obey `/ai/engineering_guidelines.md` (conventions) and assemble the system from the building blocks in `/ai/capability_definitions.md`. Do not restate those documents — apply them.

---

## AGENT ROSTER

1. **Orchestration Agent (Lead)** — Owns the plan. Decomposes the goal into tasks, resolves the shared type contract first, dispatches work to the Backend and Frontend agents in parallel, enforces the quality gates, and integrates the result. Breaks ties and owns the merge.
2. **Backend Agent** — Owns `/src` (Express + TypeScript + MySQL). Delivers the Controller–Service–Repository stack, authentication, the data-access layer, and the transactional checkout.
3. **Frontend Agent** — Owns `/frontend` (React + Vite + TypeScript + Tailwind + Framer Motion). Delivers the typed API clients, global state contexts, premium UI, and real-time catalog filtering.

---

## PRIME DIRECTIVE

Generate a **complete, runnable, type-safe** application:

- A customer can **register**, **log in**, **browse and filter** a product catalog, **add items to a cart**, **check out** (paid, transactional, stock-safe), and **view order history**.
- The entire stack runs with a single `docker-compose up` (MySQL 8 + API), with the frontend served by Vite.
- `npm run build` (backend) and `tsc -b && vite build` (frontend) MUST both pass with **zero type errors**.

---

## GLOBAL CONSTRAINTS (NON-NEGOTIABLE)

- **TypeScript only**, `strict: true`, explicit return types on all exported functions. No `any` — use `unknown` + narrowing.
- **Architecture:** Controller → Service → Repository. Controllers are thin; services hold business logic; repositories are the only SQL layer.
- **Naming:** `camelCase` for code, `PascalCase` for components/types, `snake_case` for all database tables/columns. The repository layer is the translation seam.
- **Errors:** one `AppError` class + one central `errorHandler` + `asyncHandler` wrappers. Production hides internals. Never `res.status(500)` in a controller.
- **Auth:** stateless JWT (`{ sub, email }`), bcrypt-hashed passwords, `authenticate` middleware for protected routes, structural token validation.
- **Security (OWASP):** parameterized SQL, `helmet`, restricted CORS, body-size limits, secrets only from `env`. No secret is ever hard-coded.

---

## EXECUTION PIPELINE

The Orchestration Agent MUST run these phases. Phase 2 streams are **parallel**.

### Phase 0 — Foundation & Shared Contract (blocking)
- Scaffold the monorepo: backend `/src`, frontend `/frontend`, `docker-compose.yml`, `Dockerfile`, `tsconfig` files.
- Define the **shared domain types** (`User`, `Product`, `Order`, `OrderItem`, `AuthPayload`) and the `{ success, data }` API envelope. This contract is frozen and handed to both agents so their work integrates without rework.
- Author `config/init.sql` (schema + seed) and the `mysql2` pool.

### Phase 2 — Parallel Build

**Backend Agent stream**
1. `utils`: `AppError`, `asyncHandler`, `jwt`.
2. `middleware`: `authenticate`, `validate`, `errorHandler`.
3. `repositories`: user, product, cart, order (with `withTransaction` for checkout).
4. `services`: auth, product, cart, order (business rules + invariants).
5. `controllers` + `routes`: wire `/api/auth`, `/api/products`, `/api/cart`, `/api/orders`, plus `/api/health`.

**Frontend Agent stream**
1. `api`: typed axios client + per-domain clients (`auth`, `products`, `cart`, `orders`) with token attachment.
2. `context`: `AuthContext` (session rehydrate via `/auth/me`), `CartContext`.
3. `components/ui`: `Button`, `Input`, `Toast`; `components/layout`: `Navbar`, `Footer`, `ProtectedRoute`, `PageTransition`, `ScrollToTop`.
4. Pages + **real-time catalog filtering**; `CartDrawer`; Tailwind tokens + Framer Motion presets in `lib/motion.ts`.

### Phase 3 — Integration & Quality Gates
- Orchestration Agent merges streams and runs the gates below.

---

## QUALITY GATES (must all pass before "done")

- [ ] Backend `npm run build` → 0 errors. Frontend `tsc -b && vite build` → 0 errors.
- [ ] Every protected route is guarded by `authenticate`.
- [ ] Checkout is atomic: order + items + stock decrement + cart clear in one transaction, with oversell protection.
- [ ] No raw string-concatenated SQL anywhere; all queries parameterized.
- [ ] No domain `snake_case` field leaks into a service signature or HTTP response.
- [ ] `docker-compose up` brings up a healthy DB and a reachable API on `/api/health`.

---

## OUTPUT EXPECTATION

Produce the full file tree with complete, idiomatic implementations — not stubs. When a decision is ambiguous, prefer the choice that best satisfies the guidelines and capability definitions, document the assumption inline, and proceed. Do not stop for confirmation on reversible, in-scope work.
