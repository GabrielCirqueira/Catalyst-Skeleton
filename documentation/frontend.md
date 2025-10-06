# Frontend (web/)

Este documento explica a estrutura e o fluxo do frontend React que vive em `web/`.

## Tecnologias
- React 18 + TypeScript
- Vite 7 (HMR, build rápido)
- Mantine 8 (UI e tema) + `@mantine/core/styles.css`
- React Router (roteamento via `createBrowserRouter`)
- `vite-tsconfig-paths` (aliases do TS no Vite)
- `vite-plugin-symfony` (integração com Symfony para injetar tags no Twig)

## Estrutura
- `web/main.tsx`: ponto de entrada. Renderiza `<App />` em `#root`.
- `web/App.tsx`: define o roteador e provê `<MantineProvider theme={theme}>`.
- `web/layouts/`: layouts de página. Ex.: `MainLayout.tsx` combina cabeçalho/rodapé e um `<Outlet />`.
- `web/pages/`: páginas carregadas via lazy routes.
  - `Home/` e `NotFound/` (404) com `index.ts` para lazy import e `Page.tsx` com o componente.
- `web/themes/theme.ts`: tema Mantine com a paleta `brand` e outras customizações.
- `web/assets/`: ícones e assets estáticos do frontend.

Aliases (via `tsconfig.json` + `vite-tsconfig-paths`):
- `@app/...` aponta para `web/...` (por exemplo `@app/pages/Home`).

## Roteamento
Em `web/App.tsx`:
- Rota raiz `/` com `MainLayout`.
- Index route: `Home` (lazy).
- Rota coringa `*`: `NotFound` (lazy).

## Estilos e tema
- Mantine provê tema global via `MantineProvider`.
- `theme.ts` define cores (inclui `brand`) e demais tokens.
- Para fontes/vars extras, ver `postcss.config.cjs` (preset Mantine).

## Execução e build
- Dev: `npm run dev` (ou `make up-d` para rodar no container `vite-react`).
- Build: `npm run build` (gera artefatos Vite a partir de `vite.config.js`).
- Watch (modo dev em build): `npm run watch`.

## Lint/format
- Lint: `./cli/frontend-lint.sh` (ou `npm run lint:frontend`).
- Auto-fix: `./cli/frontend-fix.sh` (ou `npm run lint:frontend:fix`).
- VS Code: salvar aciona auto-fix (ver `.vscode/settings.json`).

