# Frontend (web/)

Este documento explica a estrutura e o fluxo do frontend React que vive em `web/`.

> Versão enxuta — prioriza o mínimo necessário pra rodar bem, com uma trilha clara do que adicionar depois e em que ordem, em vez de instalar tudo de uma vez.

## Tecnologias

### Núcleo (sempre instalado)

| Tecnologia | Papel |
| :--- | :--- |
| **React 19** + **TypeScript 5.9** | UI reativa, modo strict |
| **Vite 7** | Build tool e dev server com HMR ultra-rápido |
| **Tailwind CSS 4** | Motor de estilo CSS-first; sem `tailwind.config.js` |
| **HeroUI v3** (`@heroui/react` + `@heroui/styles`) | Componentes prontos e acessíveis |
| **React Router 7** | Roteamento via `createBrowserRouter` + lazy loading |
| **TanStack Query 5** | Estado do servidor, cache e invalidação |
| **Zustand 5** | Estado global — só para o que não vem da API (auth, UI global) |
| **Zod 4** | Validação de respostas da API e de formulários críticos |
| **Axios** | HTTP client centralizado com interceptores JWT |
| **tailwindcss-motion** | Animações simples via classe Tailwind — zero JS |
| **Biome 1.9** | Linter, formatter e organizador de imports |

> **Regra de Zustand**: não criar store por feature "por precaução". Começar com estado local/Context e migrar pra Zustand só quando sentir dor real de estado espalhado.
>
> **Regra de animação**: `tailwindcss-motion` é o padrão. `motion`/`AnimatePresence` do Framer Motion (módulo `ui-extra`) só entra quando há necessidade concreta de animar montagem/desmontagem condicional.

### Módulo `ui-extra` (opt-in — ative no setup.sh)

| Tecnologia | Papel |
| :--- | :--- |
| **Framer Motion** | Animações declarativas com `AnimatePresence` |
| **Recharts** | Gráficos SVG reativos (+ `web/shadcn/components/ui/chart.tsx`) |

## Estrutura de Diretórios

```
web/
├── main.tsx              Entry point — QueryClient, HeroUIProvider, ToastProvider
├── App.tsx               Router raiz (createBrowserRouter)
├── index.css             @import tailwindcss + @heroui/styles + tailwindcss-motion
├── config/api.ts         Instância Axios centralizada com interceptores JWT
├── features/auth/        hooks, api, types de autenticação
├── layouts/
│   ├── MainLayout.tsx    Header + Outlet + Footer
│   ├── Header.tsx        Navbar global (tema, auth)
│   ├── Footer.tsx        Rodapé global
│   ├── AuthLayout.tsx    Layout centrado para Login/Cadastro
│   └── AppContainer.tsx  Container responsivo de conteúdo
├── pages/
│   ├── Home/             Landing page pública
│   ├── Login/            Página de login
│   ├── Cadastro/         Página de cadastro
│   └── NotFound/         404
├── routes/               RotaProtegida.tsx
├── shared/
│   ├── lib/cn.ts         Utilitário cn() — clsx + tailwind-merge
│   ├── ui/layout.tsx     Primitivos: Flex, HStack, VStack, Box, Grid, Container
│   ├── hooks/            useDebounce, useMountEffect, useMediaQuery, useFiltrosUrl
│   ├── components/       ErrorBoundary, DialogOuDrawer
│   └── utils/            lazyWithRetry, animacoes, formatadores
└── stores/useAuthStore.ts Estado de autenticação (Zustand + localStorage)
```

> `web/test/`, `e2e/` e `.storybook/` só passam a existir quando a ferramenta correspondente for adicionada — ver Apêndice.

## Setup do CSS (`web/index.css`)

Tailwind v4 é CSS-first — nenhum `tailwind.config.js` necessário:

```css
@import "tailwindcss";
@import "@heroui/styles";
@plugin "tailwindcss-motion";
```

## Primitivos de Layout e Texto (`web/shared/ui/layout.tsx`)

> **Regra obrigatória:** nunca usar `<div>`, `<p>`, `<h1>`–`<h6>` ou `<span>` diretamente. Usar sempre o componente correspondente.

```tsx
import { Box, HStack, VStack, Flex, Grid, Container, Text } from '@/shared/ui/layout'
```

**Layout (estrutura):**

| Componente | Equivalente | Quando usar |
| :--- | :--- | :--- |
| `<Box>` | `<div>` | Container genérico |
| `<HStack>` | `<div className="flex flex-row items-center gap-2">` | Filhos lado a lado |
| `<VStack>` | `<div className="flex flex-col gap-2">` | Filhos empilhados |
| `<Flex>` | `<div className="flex gap-2">` | Flex com direção manual |
| `<Grid>` | `<div className="grid gap-4">` | Grid de colunas |
| `<Container>` | `<div className="mx-auto w-full px-4 max-w-screen-xl">` | Seção centralizada |

**Texto (tipografia):**

| Componente | Equivalente | Quando usar |
| :--- | :--- | :--- |
| `<Text>` | `<p>` | Parágrafo (padrão) |
| `<Text as="h1">` … `<Text as="h6">` | `<h1>`–`<h6>` | Títulos |
| `<Text as="span">` | `<span>` | Texto inline |
| `<Text as="strong">` | `<strong>` | Negrito semântico |
| `<Text as="small">` | `<small>` | Texto auxiliar |

Tags de estrutura de página (`<section>`, `<header>`, `<nav>`, `<main>`) são permitidas. Componentes HeroUI gerenciam os elementos de formulário.

```tsx
<HStack className="justify-between">...</HStack>
<VStack className="gap-4">...</VStack>
<Container size="lg" className="py-12">...</Container>
<Box className="rounded-xl border p-4">...</Box>
<Grid className="grid-cols-3 gap-6">...</Grid>
<Text className="text-sm text-muted">Parágrafo</Text>
<Text as="h1" className="text-4xl font-black">Título</Text>
<Text as="span" className="text-brand-500">Inline</Text>
```

## Roteamento (`web/App.tsx`)

```tsx
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route element={<MainLayout />}>
        <Route index lazy={() => import('@pages/Home/Home')} />
        <Route path="login" lazy={() => import('@pages/Login/Login')} />
        <Route path="cadastro" lazy={() => import('@pages/Cadastro/Cadastro')} />
        <Route path="*" lazy={() => import('@pages/NotFound/NotFound')} />
      </Route>
      <Route element={<MainLayout />}>
        <Route element={<RotaProtegida />}>
          <Route path="app" lazy={() => import('@pages/Home/Home')} />
        </Route>
      </Route>
    </Route>
  )
)
```

## Aliases de Importação

| Alias | Resolve para |
| :--- | :--- |
| `@/` | `web/` |
| `@app/` | `web/` |
| `@pages` | `web/pages/` |
| `@layouts` | `web/layouts/` |
| `@features/` | `web/features/` |
| `@shared/` | `web/shared/` |
| `@stores` | `web/stores/` |
| `@config` | `web/config/` |
| `@routes` | `web/routes/` |

## Regras de Ouro

1. **Sem `useEffect` em pages/features**: use TanStack Query para dados, event handlers para ações, `useMemo` para derivações, `useMountEffect` para efeitos de montagem.
2. **Componentes atômicos**: lógica pesada vai para hooks no diretório `hooks/` da própria feature.
3. **Tipagem estrita**: sem `any`. Respostas de API validadas com schema Zod.
4. **Nunca editar `node_modules/@heroui`**: customização via `className` (Tailwind), CSS variables e slots expostos.
5. **Sem tags HTML brutas**: nunca usar `<div>`, `<p>`, `<h1>`–`<h6>` ou `<span>` — usar `Box`/`HStack`/`VStack`/`Grid`/`Container` para layout e `Text`/`Text as="h1"`/`Text as="span"` para tipografia, todos de `@/shared/ui/layout`.

## Execução e Build

```bash
npm run dev        # Dev server (ou make up-d no container)
npm run build      # Build de produção
npm run type-check # tsc --noEmit
npm run validate   # type-check + lint Biome
```

## Apêndice: quando adicionar cada peça opcional

| Ferramenta | Gatilho | Instalação |
| :--- | :--- | :--- |
| Vitest + RTL | Primeira lógica que dói quebrar | `npm i -D vitest @testing-library/react` |
| Motion (Framer) | Primeira necessidade real de `AnimatePresence` | módulo `ui-extra` no setup.sh |
| Husky + lint-staged | Time cresce além de 1 pessoa | já incluso no skeleton |
| Playwright | Primeiro fluxo crítico de negócio | `npm i -D @playwright/test` |
| Storybook | Mais de uma pessoa nos mesmos componentes | `npm i -D storybook` |
