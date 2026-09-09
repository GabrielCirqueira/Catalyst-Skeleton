# Frontend (web/)

Este documento explica a estrutura e o fluxo do frontend React que vive em `web/`.

## Tecnologias

**Core (sempre instalado):**

| Tecnologia | Papel |
| :--- | :--- |
| **React 19** + **TypeScript 5.9** | UI reativa, modo strict |
| **Vite 7** | Build tool e dev server com HMR |
| **Tailwind CSS 3.4** | Utilitários CSS ? config em `.tooling/frontend/tailwind.config.cjs` |
| **Shadcn/ui** | Componentes acessíveis e customizáveis em `web/shadcn/` |
| **React Router 7** | Roteamento via `createBrowserRouter` + lazy loading |
| **TanStack Query 5** | Estado de servidor, cache e invalidação |
| **Zustand 5** | Estado global leve com persistência opcional |
| **Zod 4** | Validação de schemas (forms, respostas de API) |
| **Axios** | HTTP client centralizado com interceptores JWT |
| **Sonner** | Toasts e notificações (usado no fluxo de auth) |
| **Biome 1.9** | Linter, formatter e organizador de imports |

**Módulo `ui-extra` (opt-in ? ative no setup.sh):**

| Tecnologia | Papel |
| :--- | :--- |
| **Framer Motion** | Animações declarativas |
| **Recharts** | Gráficos SVG reativos (+ `web/shadcn/components/ui/chart.tsx`) |

## Estrutura de Diretórios

```
web/
??? main.tsx              Entry point ? inicializa QueryClient e renderiza App
??? App.tsx               Router raiz + provedores globais (ThemeProvider)
??? index.css             CSS global + design tokens (variáveis HSL)
??? config/api.ts         Instância Axios centralizada com interceptores JWT
??? contexts/             ThemeContext (dark/light mode)
??? features/             Módulos por domínio (ex: auth/)
?   ??? auth/             hooks, api, components, types
??? layouts/              MainLayout, AuthLayout, AppContainer
??? pages/                Páginas folha carregadas via lazy()
?   ??? Home/             Landing page pública
?   ??? Login/            Página de login
?   ??? Cadastro/         Página de cadastro
?   ??? NotFound/         404
??? routes/               RotaProtegida.tsx ? redireciona para /login se não autenticado
??? shadcn/               Componentes Shadcn UI (Radix UI) customizados
??? shared/               Hooks, utils e componentes reutilizáveis
??? stores/useAuthStore.ts Estado de autenticação (Zustand + localStorage)
```

## Roteamento (`web/App.tsx`)

```tsx
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      {/* Rotas públicas */}
      <Route element={<MainLayout />}>
        <Route index lazy={() => import('@pages/Home/Home')} />
        <Route path="login" lazy={() => import('@pages/Login/Login')} />
        <Route path="cadastro" lazy={() => import('@pages/Cadastro/Cadastro')} />
        <Route path="*" lazy={() => import('@pages/NotFound/NotFound')} />
      </Route>

      {/* Rotas protegidas ? substitua MainLayout por DashboardLayout quando criar área logada */}
      <Route element={<MainLayout />}>
        <Route element={<RotaProtegida />}>
          <Route path="app" lazy={() => import('@pages/Home/Home')} />
        </Route>
      </Route>
    </Route>
  )
)
```

`RotaProtegida` redireciona para `/login` se `useAuthStore.autenticado === false`.

## Aliases de Importação

Configurados em `tsconfig.json` e espelhados em `.tooling/frontend/vite.config.js`:

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
| `@shadcn/*` | `web/shadcn/components/ui/*` |

## Regras de Ouro

1. **Sem `useEffect` direto em pages/features**: Use TanStack Query para data fetching, event handlers para ações, `useMemo` para estado derivado. Se precisar sincronizar com o browser na montagem, use `useMountEffect` de `web/shared/hooks/`.
2. **Componentes atômicos**: Lógica pesada vai para hooks no diretório `hooks/` da própria feature.
3. **Tipagem estrita**: Sem `any`. Respostas de API validadas com schema Zod.

## Execução e Build

```bash
npm run dev          # Dev server com HMR (ou make up-d no container)
npm run build        # Build de produção ? public/build/
npm run type-check   # tsc --noEmit
npm run validate     # type-check + lint (Biome)
```

## Lint e Qualidade

```bash
make lint-tsx        # biome check web
make fix-tsx         # biome check --write web
```
