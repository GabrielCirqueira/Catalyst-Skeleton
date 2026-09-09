# Módulo: UI Extra (Framer Motion, Recharts, Sonner)

Ative este módulo quando o projeto precisar de animações, gráficos ou toasts avançados.

## O que este módulo adiciona

| Pacote | Descrição | Já incluso no core? |
|---|---|---|
| `framer-motion` | Animações declarativas | ? Sim |
| `recharts` | Gráficos SVG reativos | ? Sim |
| `sonner` | Sistema de toasts | ? Sim |
| `next-themes` | Dark/light mode (usado pelo Sonner) | ? Sim |

> **Nota v5:** estes pacotes estão presentes no `package.json` padrão, pois são usados pela landing page de demonstração e pelos componentes shadcn/ui inclusos.
>
> Se seu projeto **não** precisar de animações, gráficos ou toasts, remova manualmente após clonar:
> ```bash
> npm uninstall framer-motion recharts sonner next-themes
> ```
> E remova os componentes shadcn correspondentes: `web/shadcn/components/ui/chart.tsx`, `web/shadcn/components/ui/sonner.tsx`.

## Pacotes que FORAM removidos do core na v5

Estes foram removidos por não serem usados em nenhum arquivo do projeto:

- `@fortawesome/fontawesome-svg-core`
- `@fortawesome/free-solid-svg-icons`
- `@fortawesome/react-fontawesome`
- `@heroicons/react`
- `react-icons`
- `bootstrap`
- `jquery`
- `@popperjs/core`
- `lodash`
- `deepmerge`
- `es6-promise`
- `@fontsource-variable/inter`
- `@fontsource-variable/roboto`

Instale apenas os que o seu projeto realmente usar.
