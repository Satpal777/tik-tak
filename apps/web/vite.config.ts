import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare()],
  resolve: {
    alias: {
      "@tik-tak/game-engine": fileURLToPath(new URL("../../packages/game-engine/src/index.ts", import.meta.url)),
      "@tik-tak/shared": fileURLToPath(new URL("../../packages/shared/src/index.ts", import.meta.url)),
      "@tik-tak/types": fileURLToPath(new URL("../../packages/types/src/index.ts", import.meta.url)),
      "@tik-tak/ui": fileURLToPath(new URL("../../packages/ui/src/index.ts", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
})