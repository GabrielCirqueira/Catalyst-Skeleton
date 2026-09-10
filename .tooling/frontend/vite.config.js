import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import symfonyPlugin from 'vite-plugin-symfony'
import tsconfigPaths from 'vite-tsconfig-paths'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const frontendPort = Number.parseInt(process.env.FRONTEND_PORT ?? '', 10) || 5173

export default defineConfig((config) => ({
  plugins: [
    tailwindcss(),
    react(),
    symfonyPlugin(),
    tsconfigPaths({
      projects: [path.resolve(__dirname, '..', '..', 'tsconfig.json')],
    }),
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
    cors: true,
    host: true,
    hmr: {
      host: 'localhost',
      port: frontendPort,
    },
    port: frontendPort,
  },
}))
