# syntax=docker/dockerfile:1

# -----------------------------------------------------------------------------
# Stage 1 — build: install all deps and compile TypeScript to JavaScript.
# -----------------------------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies first to leverage Docker layer caching.
COPY package*.json ./
RUN npm ci

# Compile.
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 2 — deps: install production-only dependencies.
# -----------------------------------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# -----------------------------------------------------------------------------
# Stage 3 — runtime: minimal image with only what is needed to run.
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Run as the unprivileged built-in `node` user (OWASP A05).
COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=deps /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
# init.sql is read at runtime by the app, so ship it alongside the build.
COPY --chown=node:node --from=build /app/src/config/init.sql ./dist/config/init.sql

USER node
EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||5001)+'/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "dist/server.js"]
