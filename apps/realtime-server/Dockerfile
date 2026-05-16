FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json tsconfig.json ./
COPY apps/realtime-server/package.json apps/realtime-server/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/game-engine/package.json packages/game-engine/package.json

RUN pnpm install --frozen-lockfile --filter @tik-tak/realtime-server...

COPY apps/realtime-server apps/realtime-server
COPY packages/types packages/types
COPY packages/game-engine packages/game-engine

RUN pnpm --filter @tik-tak/realtime-server build

EXPOSE 4000

CMD ["pnpm", "--filter", "@tik-tak/realtime-server", "start"]
