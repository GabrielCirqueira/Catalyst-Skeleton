# Frontend (web/)

Este documento explica a estrutura e o fluxo do frontend React que vive em `web/`.

## Tecnologias
- **React 19** + **TypeScript 5.9** (strict mode)
- **Vite 7** (HMR ultra-rápido, build escalável)
- **Tailwind CSS 4** (configuração nativa CSS-first)
- **Shadcn/ui** (componentes acessíveis e customizáveis em `web/shadcn/`)
- **React Router 7** (roteamento centralizado via `createBrowserRouter`)
- **TanStack Query 5** (gerenciamento de estado do servidor, cache e invalidação)
- **Zustand 5** (estado global leve com persistência opcional)
- **Zod 4** (validação de schemas para formulários e respostas de API)
- **Biome 1.9** (linter, formatter e organizador de imports unificado)

## Estrutura de Diretórios
- `web/main.tsx`: Entry point. Inicializa QueryClient e renderiza a App.
- `web/App.tsx`: Raiz da aplicação. Configura o roteamento e provedores globais (Tema).
- `web/features/`: Módulos funcionais autossuficientes. Cada feature (ex: `auth`) agrupa seus hooks, components, API e types.
- `web/pages/`: Páginas "folha" carregadas via lazy loading para otimização de bundle.
- `web/layouts/`: Layouts reutilizáveis que envolvem as páginas (ex: `MainLayout` com Header/Footer).
- `web/shared/`: Hooks, componentes UI (shadcn) e funções utilitárias compartilhadas.
- `web/stores/`: Definições de estado global via Zustand (ex: `useAuthStore`).
- `web/config/`: Configurações centrais, incluindo a instância Axios (`api.ts`).

## Regras de Ouro (Cultura de Engenharia)
1. **Banimento do `useEffect`**: O uso direto de `useEffect` em páginas e features é proibido.
   - Use **Estado Derivado** ou **useMemo** para cálculos.
   - Use **Event Handlers** (`onClick`, `onSubmit`) para disparar ações.
   - Use **TanStack Query** para busca de dados.
   - Para sincronização com o browser na montagem, use o hook abstraído `useMountEffect`.
2. **Componentes Atômicos**: Mantenha os componentes focados. Lógica pesada deve ser extraída para hooks no diretório `hooks` da própria feature.
3. **Tipagem Estrita**: Evite o uso de `any`. Toda resposta de API deve ter um schema Zod correspondente para validação em runtime.

## Roteamento
Utilizamos o padrão **Remix Router** no `web/App.tsx`:
- Definição via `createBrowserRouter` + `createRoutesFromElements`.
- Uso de `lazy()` para code-splitting automático por rota.
- Guardas de rota (ex: `RotaProtegida.tsx`) interceptam acessos baseados no estado do `useAuthStore`.

## Aliases de Importação
Configurados no `tsconfig.json` para evitar caminhos relativos complexos:
- `@/`: `web/`
- `@features/`: `web/features/`
- `@shared/`: `web/shared/`
- `@stores/`: `web/stores/`
- `@config/`: `web/config/`
- `@layouts/`: `web/layouts/`
- `@pages/`: `web/pages/`
- `@shadcn/`: `web/shadcn/`

## Execução e Build
- **Desenvolvimento**: `npm run dev` (rodando localmente ou via `make up-d` no container `vite-react`).
- **Verificação de Tipos**: `npm run type-check`.
- **Análise Final**: `npm run validate` (roda type-check + lint).
- **Build de Produção**: `npm run build`.

## Lint e Qualidade
- **Lint/Check**: `npx biome check web` (ou `make lint-tsx`).
- **Auto-fix**: `npx biome check --write web` (ou `make fix-tsx`).
