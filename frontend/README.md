# Aura — Frontend

A premium, luxury-aesthetic storefront for the **Aura eCommerce Platform**, built with **React + TypeScript**, **Tailwind CSS**, and **Framer Motion**.

## Highlights

- Minimalist “quiet luxury” design — slate / emerald / gold palette, glassmorphism, generous whitespace.
- Polished micro-interactions: page transitions, product-card hovers, an animated Add-to-Cart state, and a slide-over cart drawer.
- Full client-side validated **Login / Sign-up** flows.
- **Catalog** with real-time search, category + price filters, and sorting.
- **Detailed product view** with image gallery, specs, and quantity selector.
- Persistent **cart** (guest = localStorage, synced to the backend when signed in) and a **3-step checkout wizard** (Shipping → Payment simulator → Confirmation).
- **Account** page with profile summary and an order-history table.

## Tech

| Concern        | Choice                          |
| -------------- | ------------------------------- |
| Framework      | React 18 + TypeScript           |
| Build tool     | Vite                            |
| Styling        | Tailwind CSS                    |
| Animation      | Framer Motion                   |
| Routing        | React Router v6                 |
| HTTP           | Axios (JWT bearer interceptor)  |
| Icons          | lucide-react                    |

## Getting started

```bash
npm install
cp .env.example .env   # adjust VITE_API_URL if needed
npm run dev            # http://localhost:5173
```

### Build

```bash
npm run build
npm run preview        # serve the production build locally
```

## Backend connection

The app consumes the Aura backend at the base URL in `VITE_API_URL`
(defaults to `http://localhost:5001/api`). Endpoints used:

| Method | Path                | Purpose                |
| ------ | ------------------- | ---------------------- |
| POST   | `/auth/register`    | Create account         |
| POST   | `/auth/login`       | Sign in (returns JWT)  |
| GET    | `/auth/me`          | Rehydrate session      |
| GET    | `/products`         | List products          |
| GET    | `/products/:id`     | Product detail         |
| GET    | `/cart`             | Fetch server cart      |
| POST   | `/cart`             | Add item               |
| PUT    | `/cart/:productId`  | Update quantity        |
| DELETE | `/cart/:productId`  | Remove item            |
| GET    | `/orders`           | Order history          |
| POST   | `/orders`           | Place order            |

The JWT is stored in `localStorage` (`aura.token`) and attached as a
`Bearer` header on every request. If the backend is unreachable, the catalog
falls back to a bundled demo dataset so the UI stays fully demonstrable.

## State

- **`AuthContext`** — user/token, login/register/logout, session rehydration.
- **`CartContext`** — items, drawer state, totals; localStorage for guests and
  best-effort backend sync once authenticated.

## Docker

A production image serves the static build via `nginx:alpine`:

```bash
docker build -t aura-frontend \
  --build-arg VITE_API_URL=http://localhost:5001/api .
docker run -p 8080:80 aura-frontend   # http://localhost:8080
```

The Nginx config adds SPA history fallback, gzip, long-lived asset caching,
hardened security headers, and a `/healthz` endpoint.

## Project structure

```
src/
├── api/          Axios client + auth/products/cart/orders services
├── components/   layout, ui primitives, ProductCard, CartDrawer, auth shell
├── context/      AuthContext, CartContext
├── data/         demo catalog fallback
├── hooks/        useProducts
├── lib/          utils, motion variants, validation
├── pages/        Home, Catalog, ProductDetail, Checkout, Account, Login, Signup
└── types/        shared domain types
```
