# syntax=docker/dockerfile:1

# -----------------------------------------------------------------------------
# Stage 1 — build: install dependencies and compile the React app to static
# assets with Vite. VITE_API_URL is baked in at build time (Vite inlines env
# vars), so it is passed as a build argument.
# -----------------------------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

# The browser talks to the backend directly, so this must be reachable from the
# client. Defaults to the documented local contract; override at build time.
ARG VITE_API_URL=http://localhost:5001/api
ENV VITE_API_URL=${VITE_API_URL}

# Install dependencies first to leverage Docker layer caching.
COPY package*.json ./
RUN npm ci

# Copy sources and produce the production build into /app/dist.
COPY . .
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 2 — serve: lightweight Nginx Alpine serving the static build with
# SPA fallback routing for React Router.
# -----------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

# Replace the default site config with our SPA-aware configuration.
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Ship the compiled assets.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
