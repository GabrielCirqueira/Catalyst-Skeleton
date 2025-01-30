import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import symfonyPlugin from 'vite-plugin-symfony'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig((config) => ({
  plugins: [
    react(),
    symfonyPlugin(),
    tsconfigPaths(),
  ],
  build: {
    rollupOptions: {
      input: {
        app: './assets/js/index.tsx',
      },
    },
    sourcemap: config.mode === 'development',
  },
  server: {
    hmr: {
      host: 'localhost',
    },
    port: 5173,
  },
}))
