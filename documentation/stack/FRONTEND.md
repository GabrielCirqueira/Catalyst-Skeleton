# Frontend (web/)

Este documento explica a estrutura e o fluxo do frontend React que vive em `web/`.

> Versão enxuta — prioriza o mínimo necessário pra rodar bem, com uma trilha clara do que adicionar depois e em que ordem, em vez de instalar tudo de uma vez.

## Tecnologias

### Núcleo (sempre instalado)

| Tecnologia | Papel |
| :--- | :--- |
| **React 19** + **TypeScript 5.9** | UI reativa, modo strict |
| **Vite 7** | Build tool e dev server com HMR ultra-rápido |
| **Chakra UI v3** (`@chakra-ui/react`) | Layout, tema, componentes e estilo |
| **React Router 7** | Roteamento via `createBrowserRouter` + lazy loading |
| **TanStack Query 5** | Estado do servidor, cache e invalidação |
| **Zustand 5** | Estado global — só para o que não vem da API (auth, UI global) |
| **Zod 4** | Validação de respostas da API e de formulários críticos |
| **Axios** | HTTP client centralizado com interceptores JWT |
| **Recharts** | Gráficos SVG reativos (dashboards, totais por categoria/origem) |
| **Biome 1.9** | Linter, formatter e organizador de imports |

> **Regra de Zustand**: não criar store por feature "por precaução". Começar com estado local/Context e migrar pra Zustand só quando sentir dor real de estado espalhado.
>
> **Regra de animação**: props do Chakra (`_hover`, `transition`). `motion`/`AnimatePresence` do Framer Motion (módulo `ui-extra`) só entra quando há montagem/desmontagem condicional.

### Módulo `ui-extra` (opt-in — ative no setup.sh)

| Tecnologia | Papel |
| :--- | :--- |
| **Framer Motion** | Animações declarativas com `AnimatePresence` |

## Estrutura de Diretórios

```
web/
├── main.tsx              Entry point — ChakraProvider, ThemeProvider, Toaster
├── App.tsx               Router raiz (createBrowserRouter)
├── config/theme/theme.ts Sistema Chakra (paleta brand)
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
│   ├── ui/toaster.tsx    toaster.create + toast.success / toast.danger
│   ├── ui/chart.tsx      wrappers Recharts
│   ├── hooks/            useDebounce, useMountEffect, useMediaQuery, useFiltrosUrl
│   ├── components/       ErrorBoundary, DialogOuDrawer
│   └── utils/            lazyWithRetry, animacoes, formatadores
└── stores/useAuthStore.ts Estado de autenticação (Zustand + localStorage)
```

> `web/test/`, `e2e/` e `.storybook/` só passam a existir quando a ferramenta correspondente for adicionada — ver Apêndice.

## Tema (`web/config/theme/theme.ts`)

`createSystem` + paleta `brand`. Estilo só com props Chakra.

## Primitivos (`@chakra-ui/react`)

> **Regra obrigatória:** nunca usar `<div>`, `<p>`, `<h1>`–`<h6>`, `<span>` nem `className`. Sempre o componente Chakra.

```tsx
import { Box, Button, Container, Field, Heading, HStack, Input, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { toast } from '@/shared/ui/toaster'
```

| Precisa de | Use |
| :--- | :--- |
| Caixa | `Box` |
| Lado a lado | `HStack` |
| Empilhado | `VStack` / `Stack` |
| Flex | `Flex` |
| Colunas | `SimpleGrid` |
| Largura máxima | `Container maxW="6xl"` |
| Parágrafo | `Text` |
| Título | `Heading` |

Tags de estrutura (`<section>`, `<header>`, `<nav>`, `<main>`) só com valor semântico — preferir `Box as="section"`. Overlay: `Dialog` / `Drawer`.

```tsx
<HStack justify="space-between">...</HStack>
<VStack gap="4">...</VStack>
<Container maxW="6xl" py="12">...</Container>
<Box rounded="xl" borderWidth="1px" p="4">...</Box>
<SimpleGrid columns={3} gap="6">...</SimpleGrid>
<Text fontSize="sm" color="fg.muted">Parágrafo</Text>
<Heading as="h1" size="4xl">Título</Heading>
<Text as="span" color="brand.fg">Inline</Text>

<Field.Root invalid={!!erro}>
  <Field.Label>Usuário</Field.Label>
  <Input value={valor} onChange={(e) => setValor(e.target.value)} />
  <Field.ErrorText>{erro}</Field.ErrorText>
</Field.Root>

<Button colorPalette="brand" loading={pendente} width="full">Salvar</Button>
toast.success('Salvo.')
```

`ChakraProvider` usa `theme` de `web/config/theme/theme.ts`.

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
4. **Nunca editar `node_modules/@chakra-ui`**: customização via `createSystem` em `web/config/theme/theme.ts` e props (`colorPalette`, `variant`, `p`, `gap`).
5. **Sem tags HTML brutas**: `Box`/`HStack`/`VStack`/`SimpleGrid`/`Container`/`Text`/`Heading` de `@chakra-ui/react`.

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
