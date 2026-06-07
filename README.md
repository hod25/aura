# Aura — Premium AI-Driven Full-Stack eCommerce Platform

Aura is a production-grade, AI-driven full-stack eCommerce platform engineered for a
premium retail experience. It pairs a strictly-typed Node.js/Express + MySQL backend
with a modern React (Vite + TypeScript + Tailwind) storefront, delivering an end-to-end
flow that spans catalog browsing, authentication, cart management, and checkout.

---

## 1. Project Overview & Architecture

Aura is delivered as a **highly scalable monorepo** with explicit `/backend` and
`/frontend` separation, cleanly isolating each deployable while keeping the entire stack
in a single, reproducible repository:

| Layer        | Location              | Stack                                                      |
| ------------ | --------------------- | ---------------------------------------------------------- |
| **Backend**  | `/backend`            | Node.js 20, Express, TypeScript, MySQL 8, JWT auth         |
| **Frontend** | `/frontend`           | React, Vite, TypeScript, Tailwind CSS, served via Nginx    |
| **Database** | `/backend/src/config` | MySQL 8 with auto-seeded schema (`init.sql`)               |

### Architectural Pattern

The backend follows a disciplined **Controller → Service → Repository** layering with
strict TypeScript encapsulation, ensuring a unidirectional dependency flow and clean
separation of HTTP, business logic, and data-access concerns:

```
HTTP Request
    │
    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Routes      │ ──▶ │ Controllers  │ ──▶ │  Services    │ ──▶ │ Repositories │ ──▶ MySQL
│ (transport)  │     │ (validation/ │     │ (business    │     │ (data access │
│              │     │  HTTP I/O)   │     │  logic)      │     │  & SQL)      │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

- **Routes** (`backend/src/routes`) — declare transport endpoints and bind middleware.
- **Controllers** (`backend/src/controllers`) — translate HTTP I/O, never touch SQL directly.
- **Services** (`backend/src/services`) — own business rules and orchestration.
- **Repositories** (`backend/src/repositories`) — encapsulate all data access against MySQL.
- **Validation & resilience** — declarative request schemas (`backend/src/validators`),
  an in-memory auth rate limiter (`backend/src/middleware/rateLimiter.ts`), and a
  structured logger (`backend/src/utils/logger.ts`) harden the system boundary.
- **Cross-cutting** — typed middleware (`backend/src/middleware`), error handling
  (`AppError`, `errorHandler`), JWT utilities, and fail-fast environment validation
  (`backend/src/config/env.ts`) enforce reliability at the system boundary.

The **type layer is explicitly bisected** — raw persistence rows (`backend/src/types/db.ts`)
are kept distinct from domain entities (`backend/src/types/domain.ts`) so that database
shape never leaks into the public API surface.

The frontend mirrors this discipline with a typed API client layer (`frontend/src/api`),
context-based state management (`AuthContext`, `CartContext`), and a component library
**decoupled into UI primitives and domain features** — `components/ui` for presentation
primitives and `components/features/{product,cart,checkout,auth,account}` for
business-aligned composites.

---

## 2. Zero-Touch Quick Start

The entire production-grade stack — frontend, backend, and database — boots with a
**single command**. No local Node, npm, or MySQL installation is required; only Docker.

```bash
docker compose up --build
```

This orchestrates three containers on a private bridge network and exposes the
following ports to the host:

| Service       | Container        | Host Port | Description                                  |
| ------------- | ---------------- | --------- | -------------------------------------------- |
| **Frontend**  | `aura-frontend`  | `3000`    | React storefront served by Nginx             |
| **Backend**   | `aura-backend`   | `5001`    | Express REST API (base path `/api`)          |
| **MySQL**     | `aura-db`        | `3306`    | MySQL 8.0 with auto-seeded schema            |

Once the stack is healthy:

- **Storefront** → <http://localhost:3000>
- **API** → <http://localhost:5001/api>
- **Health probe** → <http://localhost:5001/api/health>

The MySQL schema and seed data are applied automatically on first boot via the
`docker-entrypoint-initdb.d` hook (`backend/src/config/init.sql`), so the catalog is
populated out of the box.

---

## 3. Manual Interventions & The "AI-Gap" Analysis

While the bulk of Aura was scaffolded through AI-assisted generation, several
integration-level decisions required **human engineering judgment** that the AI could
not resolve perfectly on the first touch. These interventions represent the "AI-Gap":
the class of cross-cutting, systems-level problems where a human's holistic mental model
of the running system is faster and more reliable than recursive prompt-tuning.

### 3.1 Multi-Agent Concurrency Resolution

**Intervention:** Parallel agent execution introduced a **transient build failure in
`frontend/src/components/ui/Button.tsx`**. Two streams touched the same primitive
concurrently: one widened the props to extend `HTMLMotionProps<'button'>`, while another
re-declared an `Omit<ButtonHTMLAttributes, keyof HTMLMotionProps>` override. The
overlapping property contracts cancelled out `children`, `className`, and `disabled`,
cascading into 25+ downstream type errors. The collision was compounded by **file-lock
state edits** — the file mutated mid-write as agents raced the same working tree.

**The AI-Gap:** No single agent could observe the *other* agent's in-flight edit, so each
produced a locally-valid diff that was globally inconsistent. A human imposed **structural
scoping**: re-reading the file immediately before each write, collapsing the props to a
single authoritative `Omit<HTMLMotionProps<'button'>, 'children'> & { children?: ReactNode }`
contract, and — critically — **isolating the staging area** (`git add` on a precise path set
rather than `git add .`) so the clean `Button.tsx` fix could be committed and pushed
without sweeping in the other stream's half-finished component moves. Concurrency safety
here is a coordination problem outside any one file's content.

### 3.2 Atomic Server-Side Cart Synchronization

**Intervention:** The backend `POST /orders` endpoint builds the order **purely from
server-side session/cart state** — it deliberately ignores any client-supplied line items
to remain the single source of truth for pricing and stock. The multi-step frontend
checkout wizard, however, holds a **client-first cart** for instant UX. This created a
critical consistency gap: the server could checkout a *stale* cart. The fix injects an
**ahead-of-time `cartApi.replace(...)` adapter synchronization block** into the checkout
flow that reconciles the server cart to the client's intent *before* the order POST,
guaranteeing the transaction commits against exactly the items the user confirmed.

**The AI-Gap:** Each side was internally correct — the backend's server-authoritative
checkout is the *secure* design, and the frontend's optimistic cart is the *responsive*
design. The defect lived only in the **seam** between them, invisible to any agent
reasoning about a single package. Recognizing that transactional integrity demanded an
out-of-band reconciliation step — and placing it atomically before the POST so the server
cart can never diverge from the confirmed order — is a distributed-state insight, not a
templating task.

### 3.3 Decoupled Folder Migration

**Intervention:** Two structural migrations were executed without losing history. First,
the frontend component tree was **split along the architectural seam** between
*UI primitives* (`components/ui`) and *domain features*
(`components/features/{product,cart,checkout,auth,account}`), so presentation concerns are
cleanly separated from business-aligned composites. Second, the **entire backend was
lifted out of the repository root into a structured `/backend` subfolder**, formalizing
the `/backend` + `/frontend` monorepo split — performed via `git mv` so **commit-tracking
history and blame lineage were preserved** across every relocated file.

**The AI-Gap:** A naive move (delete + recreate) would have severed git history and
blame, silently erasing the provenance that makes a codebase auditable. Preserving lineage
requires `git mv` and an understanding of how rename-detection interacts with staged,
concurrently-modified files — a version-control-systems judgment that depends on repository
state the model cannot fully introspect.

### 3.4 Port Alignment

**Intervention:** The full stack was standardized on **port 5001** for the API
communication layer. This single value is duplicated across the backend `env` layer, the
`docker-compose.yml` port map and service URLs, and the frontend's baked-in
`VITE_API_URL` build argument — aligning all of them guarantees fluid runtime
interoperability across containers and on the host.

**The AI-Gap:** An AI generating files in isolation cannot observe the host's live port
allocations, nor reconcile a value that is duplicated across the env layer, the
`docker-compose.yml` port map, and the frontend's baked-in build argument. The default
Express port also collides with common local daemons (notably macOS AirPlay on 5000). A
human engineer holding the *whole system* in mind aligned every reference in a single,
deliberate pass — far cheaper than iteratively re-prompting each file toward a consistent
value.

### Why Human Critical Thinking Won Here

Each of these problems shares a defining trait: the *correct answer lives outside any
single source file*. It is encoded in the live host environment, runtime startup
ordering, and the developer's machine layout — context an AI cannot fully perceive from
the code alone. In these situations, a human's integrated mental model of the **running
system** produces a correct fix in one deliberate action, whereas an AI tends toward
recursive prompt-tuning: a costly loop of locally-plausible edits that never converge on
the globally-correct configuration. The AI accelerated breadth; the engineer closed the
gap on depth.

---

## 4. Automated Validation

Continuous reliability is anchored by lightweight **healthcheck endpoints**:

- **Application probe** — `GET /api/health` returns `{ success: true, status: "ok",
  uptime }`, confirming the Express process is live and responsive. This endpoint is the
  canonical readiness signal for load balancers, uptime monitors, and smoke tests.
- **Database probe** — the MySQL container exposes a `mysqladmin ping` healthcheck that
  gates backend startup via `depends_on: { condition: service_healthy }`, guaranteeing
  the API never accepts traffic before its data layer is ready.

Together these probes provide layered, automated assurance that every tier of the stack
is healthy before — and while — it serves users.

---

## Project Structure

```
.
├── docker-compose.yml            # Full-stack orchestration (db, backend, frontend)
├── ai/                           # AI pipeline artifacts (initial.md, interactions log)
├── backend/                      # Backend deployable (Controller-Service-Repository)
│   ├── Dockerfile                # Backend (Node 20 + TypeScript) image
│   ├── package.json              # Backend dependencies & scripts
│   └── src/
│       ├── app.ts / server.ts    # Express bootstrap (structured logger)
│       ├── config/               # env validation, db pool, init.sql (schema + seed)
│       ├── controllers/          # HTTP I/O
│       ├── services/             # Business logic
│       ├── repositories/         # Data access
│       ├── routes/               # Transport (incl. /health)
│       ├── middleware/           # auth, validation, rate limiting, error handling
│       ├── validators/           # Declarative request schemas
│       ├── types/                # db.ts (rows) vs domain.ts (entities) — bisected
│       └── utils/                # AppError, jwt, asyncHandler, logger
└── frontend/                     # React + Vite + Tailwind storefront
    ├── Dockerfile                # Multi-stage build → Nginx
    └── src/
        ├── api/                  # Typed axios clients + contract adapters
        ├── context/             # AuthContext, CartContext (client-first cart)
        └── components/
            ├── ui/               # Presentation primitives (Button, …)
            └── features/         # Domain composites: product, cart, checkout, auth, account
```

---

## License

MIT
