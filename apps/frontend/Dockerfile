FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS dependencies
COPY pnpm-lock.yaml* pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/frontend/package.json ./apps/frontend/
RUN pnpm install --frozen-lockfile || pnpm install

FROM dependencies AS build
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=${VITE_CLERK_PUBLISHABLE_KEY}
ENV CLERK_PUBLISHABLE_KEY=${CLERK_PUBLISHABLE_KEY}

COPY tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/frontend/ ./apps/frontend/
RUN pnpm --filter @ermes/shared run typecheck
RUN pnpm --filter @ermes/frontend run build

FROM node:22-alpine AS frontend
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
ENV NODE_ENV=production

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=dependencies /app/apps/frontend/node_modules ./apps/frontend/node_modules

COPY --from=build /app/packages ./packages
COPY --from=build /app/apps/frontend/package.json ./apps/frontend/
COPY --from=build /app/apps/frontend/dist ./apps/frontend/dist
COPY --from=build /app/apps/frontend/vite.config.ts ./apps/frontend/
COPY --from=build /app/pnpm-workspace.yaml ./
COPY --from=build /app/package.json ./

EXPOSE 5173
CMD ["pnpm", "--filter", "@ermes/frontend", "run", "preview"]
