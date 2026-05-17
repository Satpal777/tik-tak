# Tik Tak Platform

Scalable pnpm workspace monorepo for a React board-game frontend, Cloudflare Workers AI API, shared game engine, and future realtime multiplayer server.

## Structure

```txt
apps/
  web/              React + Vite + Tailwind frontend
  worker/           Cloudflare Worker AI API
  realtime-server/  Future Node.js + Socket.IO multiplayer server

packages/
  types/            Shared API and game types
  game-engine/      Board validation, move rules, win/draw detection
  shared/           Shared API constants
  ui/               Future shared UI primitives
```

## Setup

Enable pnpm with Corepack or install pnpm globally:

```bash
corepack enable
corepack prepare pnpm@10.0.0 --activate
pnpm install
```

## Local Development

Run the React app:

```bash
pnpm dev:web
```

Run the Cloudflare Worker locally:

```bash
pnpm dev:worker
```

Run the realtime server for online friend mode:

```bash
pnpm dev:realtime
```

Or run the realtime server with Docker Compose:

```bash
docker compose up --build realtime-server
```

The web app proxies `/api/*` to the Worker at `http://localhost:8787`.
Online friend mode connects to Socket.IO at `http://localhost:4000`.

Optional web environment:

```bash
cp apps/web/.env.example apps/web/.env
```

Both the Worker AI API and realtime server read allowed frontend origins from `CLIENT_ORIGIN`. Use a comma-separated value when more than one frontend should be allowed:

```txt
CLIENT_ORIGIN=https://tik-tak.pages.dev,http://localhost:5173
```

## AI Endpoint

`POST /api/ai/best-move`

Request:

```json
{
  "board": [
    [null, "X", null],
    ["O", "X", null],
    [null, null, "O"]
  ],
  "aiPlayer": "X"
}
```

Response:

```json
{
  "move": {
    "row": 2,
    "col": 1
  },
  "confidence": 0.9,
  "reasoning": "Blocks the opponent while preserving a win path."
}
```

The Worker uses Cloudflare Workers AI model `@cf/meta/llama-3.3-70b-instruct-fp8-fast` for streamed analysis. The AI binding is configured in `apps/worker/wrangler.jsonc`:

```jsonc
"ai": {
  "binding": "AI"
}
```

## Commands

```bash
pnpm build:web
pnpm build
pnpm lint
pnpm typecheck
pnpm deploy:web
pnpm deploy:worker
```

## Cloudflare Pages Deployment

This repository is a pnpm workspace. Configure Cloudflare Pages from the repository root so npm does not try to install `workspace:*` dependencies from `apps/web`.

Use these Pages build settings:

```txt
Root directory: /
Build command: pnpm build:web
Build output directory: apps/web/dist
Build system: V2
```

If Cloudflare still picks npm, set the install command to:

```bash
corepack enable && pnpm install --frozen-lockfile
```

## Architecture Notes

- The frontend does not contain AI logic. It sends board state to the Worker API through `apps/web/src/api/ai.ts`.
- The Worker uses native `fetch` handlers only. There is no Express, Hono, or server framework in the AI path.
- Shared board rules live in `packages/game-engine`, so frontend, Worker, and future realtime server use the same validation.
- `apps/realtime-server` is intentionally separate from AI. It is reserved for future Socket.IO rooms, matchmaking, presence, and board synchronization.
- The Worker validates board input and returns the game engine's minimax move for perfect play. Workers AI can still be used for streamed analysis.
