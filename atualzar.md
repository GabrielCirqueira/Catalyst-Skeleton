# Frontend (web/)

Este documento explica a estrutura e o fluxo do frontend React que vive em `web/`.
> Versão enxuta — prioriza o mínimo necessário pra rodar bem, com uma trilha clara do que adicionar depois e em que ordem, em vez de instalar tudo de uma vez.

## Tecnologias

### Núcleo (instala agora)
- **React 19** + **TypeScript 5.9** (strict mode)
- **Vite 7** (HMR ultra-rápido, build escalável)
- **Tailwind CSS 4** (configuração nativa CSS-first) — motor de estilo, inclusive por baixo do HeroUI
- **HeroUI v3** (`@heroui/react` + `@heroui/styles`) — componentes prontos, instalados via npm
- **React Router 7** (roteamento centralizado via `createBrowserRouter`)
- **TanStack Query 5** (gerenciamento de estado do servidor, cache e invalidação — é o que conversa com a API PHP)
- **Biome 1.9** (linter, formatter e organizador de imports unificado)

### Estado e validação (uso mínimo — não expandir sem necessidade real)
- **Zustand 5** — só para estado que não vem da API PHP (ex: `useAuthStore`, sidebar aberta, tema). Não criar um store por feature "por precaução"; começar com estado local/Context e migrar pra Zustand só quando sentir dor real de estado espalhado.
- **Zod 4** — só para validar a **resposta da API PHP** dentro do TanStack Query (pega desalinhamento de contrato entre backend e frontend em runtime, algo que o TypeScript sozinho não garante). Validação de formulário pode esperar — `required` do HTML + checagem manual resolvem no início.
- **tailwindcss-motion** — animações simples via classe Tailwind (hover, entrada de card, toast). Zero JS, some do bundle se não for usado.

## Estrutura de Diretórios

- `web/main.tsx`: Entry point. Inicializa QueryClient e renderiza a App.
- `web/App.tsx`: Raiz da aplicação. Configura roteamento e provedores globais.
- `web/features/`: Módulos funcionais autossuficientes (hooks, components, API, types por feature).
- `web/pages/`: Páginas "folha" carregadas via lazy loading para otimização de bundle.
- `web/layouts/`: Layouts reutilizáveis (ex: `MainLayout` com Header/Footer).
- `web/shared/`:
  - `web/shared/ui/`: primitivos de layout que o HeroUI não traz nativamente — `Stack`, `HStack`, `VStack`, `Flex`, `Container` (ver seção Setup).
  - `web/shared/hooks/`, `web/shared/lib/`: hooks e utilitários compartilhados (inclui `cn()` via clsx + tailwind-merge).
- `web/stores/`: Definições de estado global via Zustand (ex: `useAuthStore`).
- `web/config/`: Configurações centrais, incluindo instância Axios (`api.ts`).

> `web/test/`, `e2e/` e `.storybook/` só passam a existir quando a ferramenta correspondente (Vitest, Playwright, Storybook) for de fato adicionada — ver Apêndice.

## Regras de Ouro (Cultura de Engenharia)

1. **Banimento do `useEffect`**: uso direto em páginas e features é proibido.
   - Use **Estado Derivado** ou **useMemo** para cálculos.
   - Use **Event Handlers** (`onClick`, `onSubmit`) para disparar ações.
   - Use **TanStack Query** para busca de dados.
   - Para sincronização com o browser na montagem, use `useMountEffect`.
2. **Componentes Atômicos**: lógica pesada extraída para hooks na própria feature.
   - Nunca editar componentes dentro de `node_modules/@heroui`. Customização via `className` (Tailwind), CSS variables e slots expostos.
3. **Tipagem Estrita**: evite `any`. Toda resposta de API deve ter schema Zod correspondente.
4. **Zustand e Zod com uso mínimo**: antes de criar um store ou schema novo, pergunte se o problema já apareceu de verdade ou se é precaução antecipada. Prefira adicionar quando a dor aparecer.
5. **Critério de animação**: `tailwindcss-motion` é o padrão pra tudo que for simples. `Motion`/`AnimatePresence` só entra na lista de dependências no dia em que houver uma necessidade concreta de animar montagem/desmontagem condicional.

## Roteamento

Padrão **Remix Router** no `web/App.tsx`:
- Definição via `createBrowserRouter` + `createRoutesFromElements`.
- `lazy()` para code-splitting automático por rota.
- Guardas de rota (`RotaProtegida.tsx`) baseadas no `useAuthStore`.

## Aliases de Importação

Configurados no `.tooling/frontend/tsconfig.json`:
- `@/`: `web/`
- `@features/`: `web/features/`
- `@shared/`: `web/shared/`
- `@stores/`: `web/stores/`
- `@config/`: `web/config/`
- `@layouts/`: `web/layouts/`
- `@pages/`: `web/pages/`

> `@test/` só é adicionado junto com o Vitest, quando chegar a hora (ver Apêndice).

## Setup

Instalação do núcleo:
```bash
npm install @heroui/react @heroui/styles zustand zod tailwindcss-motion
```

CSS principal (`web/styles/globals.css` ou equivalente):
```css
@import "tailwindcss";
@import "@heroui/styles";
@plugin "tailwindcss-motion";
```

Primitivos de layout (`web/shared/ui/layout.tsx`):
```tsx
import { cn } from '@shared/lib/cn'
import type { ComponentProps } from 'react'

export const Flex = ({ className, ...props }: ComponentProps<'div'>) => (
  <div className={cn('flex gap-2', className)} {...props} />
)
export const HStack = ({ className, ...props }: ComponentProps<'div'>) => (
  <Flex className={cn('flex-row items-center', className)} {...props} />
)
export const VStack = ({ className, ...props }: ComponentProps<'div'>) => (
  <Flex className={cn('flex-col', className)} {...props} />
)
```

## Execução e Build

- **Desenvolvimento**: `npm run dev`
- **Verificação de Tipos**: `npm run type-check`
- **Análise Final**: `npm run validate` (type-check + lint)
- **Build de Produção**: `npm run build`

> `test`, `test:e2e` e `storybook` entram na lista de scripts conforme cada ferramenta opcional for adicionada.

## Lint e Qualidade

- **Lint/Check**: `npx biome check web` (ou `make lint-tsx`)
- **Auto-fix**: `npx biome check --write web` (ou `make fix-tsx`)
- Até a chegada do Husky, rodar `biome check` manualmente antes de cada commit é suficiente.

## Apêndice: quando e como adicionar cada peça opcional

| Ferramenta | Gatilho pra adicionar | Instalação |
|---|---|---|
| Vitest + RTL | Primeira lógica/fluxo que dói quebrar | `npm install -D vitest @testing-library/react @testing-library/jest-dom` |
| Husky + lint-staged | Time cresce além de 1 pessoa | `npm install -D husky lint-staged` |
| Motion | Primeira necessidade real de `AnimatePresence` | `npm install motion` |
| Playwright | Primeiro fluxo crítico de negócio (checkout, pagamento) | `npm install -D @playwright/test` |
| Storybook | Mais de uma pessoa mexendo nos mesmos componentes | `npm install -D storybook` |
| Renovate | Quando manter dependências manualmente virar trabalho perceptível | configuração via app do GitHub, sem pacote npm |