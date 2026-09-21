# Módulo: UI Extra (Framer Motion)

Ative este módulo quando houver necessidade concreta de animar montagem/desmontagem condicional (`AnimatePresence` em modais, drawers, listas que entram/saem do DOM).

`tailwindcss-motion` já é o padrão core para animações simples (hover, entrada de seção, transições) — ver `documentation/stack/FRONTEND.md`. Gráficos (`recharts` + `web/shared/ui/chart.tsx`) e toasts (`@heroui/react`) já são core, não fazem parte deste módulo.

## O que este módulo adiciona

| Pacote | Descrição | Já incluso no core? |
|---|---|---|
| `framer-motion` | Animações declarativas com `AnimatePresence` | ❌ Não |

Se o projeto não precisar de `AnimatePresence`, não ative este módulo — não há nada para remover depois.

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
