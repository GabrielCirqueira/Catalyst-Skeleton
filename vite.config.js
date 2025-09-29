import { defineConfig } from 'vite'
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
}))
