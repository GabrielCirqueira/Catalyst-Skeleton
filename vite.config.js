import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'
import symfonyPlugin from 'vite-plugin-symfony'
import tsconfigPaths from 'vite-tsconfig-paths'

const frontendPort = Number.parseInt(process.env.FRONTEND_PORT ?? '', 10) || 5173

export default defineConfig((config) => ({
  plugins: [
    react(),
    symfonyPlugin(),
    tsconfigPaths(),
  ],
  build: {
    rollupOptions: {
      input: {
        app: './web/main.tsx',
      },
    },
    sourcemap: config.mode === 'development',
  },
  server: {
    hmr: {
      host: 'localhost',
      port: frontendPort,
    },
    port: frontendPort,
  },
    resolve: {
    alias: [
      // project sources live under `web/` in this repo
      { find: "@layouts", replacement: path.resolve(__dirname, "web", "layouts") },
      { find: "@pages", replacement: path.resolve(__dirname, "web", "pages") },
      { find: "@shadcn/lib", replacement: path.resolve(__dirname, "web", "shadcn", "lib") },
      { find: "@shadcn/hooks", replacement: path.resolve(__dirname, "web", "shadcn", "hooks") },
      {
        find: "@shadcn/components/ui",
        replacement: path.resolve(__dirname, "web", "shadcn", "components", "ui"),
      },
      {
        find: "@shadcn/components",
        replacement: path.resolve(__dirname, "web", "shadcn", "components", "ui"),
      },
      {
        find: "@shadcn/layout",
        replacement: path.resolve(__dirname, "web", "shadcn", "components", "ui", "layout"),
      },
      {
        find: "@shadcn/typography",
        replacement: path.resolve(__dirname, "web", "shadcn", "components", "ui", "typography"),
      },
      {
        find: "@shadcn",
        replacement: path.resolve(__dirname, "web", "shadcn", "components", "ui"),
      },
      { find: "@", replacement: path.resolve(__dirname, "web") },
    ],
  },
}))
