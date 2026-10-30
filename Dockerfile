FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS dependencies
COPY pnpm-lock.yaml* pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/
RUN pnpm install --frozen-lockfile || pnpm install

FROM dependencies AS build
COPY tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/backend/ ./apps/backend/
RUN pnpm --filter @ermes/shared run typecheck
RUN pnpm --filter @ermes/backend run build

FROM node:22-alpine AS backend
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
ENV NODE_ENV=production

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=dependencies /app/apps/backend/node_modules ./apps/backend/node_modules

COPY --from=build /app/packages ./packages
COPY --from=build /app/apps/backend/package.json ./apps/backend/
COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/pnpm-workspace.yaml ./
COPY --from=build /app/package.json ./

EXPOSE 3000
CMD ["node", "apps/backend/dist/index.js"]
