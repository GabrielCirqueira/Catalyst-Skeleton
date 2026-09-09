import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import symfonyPlugin from 'vite-plugin-symfony'
import tsconfigPaths from 'vite-tsconfig-paths'

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
    hmr: {
      host: 'localhost',
      port: frontendPort,
    },
    port: frontendPort,
  },
  resolve: {
    alias: [
      { find: '@layouts', replacement: path.resolve(__dirname, '..', '..', 'web', 'layouts') },
      { find: '@pages', replacement: path.resolve(__dirname, '..', '..', 'web', 'pages') },
      { find: '@config', replacement: path.resolve(__dirname, '..', '..', 'web', 'config') },
      { find: '@stores', replacement: path.resolve(__dirname, '..', '..', 'web', 'stores') },
      { find: '@routes', replacement: path.resolve(__dirname, '..', '..', 'web', 'routes') },
      { find: '@features', replacement: path.resolve(__dirname, '..', '..', 'web', 'features') },
      { find: '@shared', replacement: path.resolve(__dirname, '..', '..', 'web', 'shared') },
      { find: '@app', replacement: path.resolve(__dirname, '..', '..', 'web') },
      { find: '@', replacement: path.resolve(__dirname, '..', '..', 'web') },
    ],
  },
}))
