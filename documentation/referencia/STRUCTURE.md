# Estrutura do Projeto

Este documento descreve a organização de diretórios e arquivos do **Catalyst Skeleton v5**.

---

## Raiz do Projeto

```
catalyst-skeleton/
??? .skeleton-modules/      # Módulos opcionais (async, observability, ui-extra)
??? .tooling/               # Todas as configurações de ferramentas centralizadas
??? bin/                    # Executáveis (console)
??? cli/                    # Comandos rápidos (uso diário)
??? config/                 # Configurações Symfony (bundles, services, packages)
??? devops/                 # Dockerfiles, docker-compose e configurações de infra
??? documentation/          # Documentação técnica detalhada
??? migrations/             # Migrations do Doctrine
??? public/                 # Entry point web (index.php)
??? scripts/                # Processos pesados de uso esporádico (setup, deploy)
??? src/                    # Código-fonte PHP/Symfony
??? web/                    # Código-fonte React/TypeScript
??? ROADMAP.md              # Backlog numerado do lote atual
??? composer.json
??? package.json
??? Makefile
??? README.md
```

---

## Pasta `.skeleton-modules/`

Contém os **módulos opcionais** do skeleton. Nenhum destes arquivos é carregado automaticamente ? eles só são copiados/instalados quando o módulo é ativado via `setup.sh`.

```
.skeleton-modules/
??? async/
?   ??? README.md
?   ??? messenger.yaml                    # config/packages/messenger.yaml
?   ??? supervisord-messenger.conf        # appended to devops/php/supervisord-prod.conf
?   ??? src/
?       ??? Message/                      # ? src/Message/
?       ??? MessageHandler/               # ? src/MessageHandler/
?       ??? Schedule/                     # ? src/Schedule/
??? observability/
?   ??? README.md
?   ??? sentry.yaml                       # config/packages/sentry.yaml
??? ui-extra/
    ??? README.md
    ??? package.deps.json                 # framer-motion, recharts
    ??? chart.tsx                         # ? web/shadcn/components/ui/chart.tsx
```

---

## Pasta `.tooling/`

Configurações de ferramentas centralizadas para reduzir poluição na raiz:

```
.tooling/
??? backend/
??? docker/
?   ??? .dockerignore
??? frontend/
?   ??? biome.json
?   ??? postcss.config.cjs
?   ??? tailwind.config.cjs
?   ??? tsconfig.json
?   ??? vite.config.js
??? git/
?   ??? commitlint.config.js
??? quality/
?   ??? phpcs.xml
?   ??? phpstan.neon
??? .editorconfig
??? .setup-done
??? .setup-progress
```

---

## Pasta `src/` (Backend)

```
src/
??? Command/            CLI: AppSeedCommand, CronHeartbeatCommand, JwtMasterCommand
??? Controller/         API REST ? roteamento e orquestração leve
??? DataObject/         DTOs de entrada tipados e validados
??? Entity/             Entidades Doctrine (Usuario, RefreshToken)
??? Enum/               Enums PHP 8.1+
??? EventListener/      Listeners + Event/ (fatos de domínio)
??? Feature/            *Feature.php + TaggedIterator (lógica grande em vários services)
??? Interface/          Contratos PHP (*Interface.php)
??? Repository/         Acesso ao banco, queries DQL/QueryBuilder
??? Serializer/         Contratos JSON de saída
??? Service/            Lógica de negócio (um service = uma ação)
??? Kernel.php
```

> Se o módulo **`async`** estiver ativo:
> `src/Message/`, `src/MessageHandler/`, `src/Schedule/` também existirão

---

## Pasta `web/` (Frontend)

```
web/
??? config/api.ts       Instância Axios com interceptores JWT
??? contexts/           ThemeContext (dark/light)
??? features/auth/      Hooks, API, components e types de autenticação
??? layouts/            MainLayout, AuthLayout, AppContainer
??? pages/              Páginas lazy ? Home, Login, Cadastro, NotFound
??? routes/             RotaProtegida.tsx
??? shadcn/             Componentes Shadcn UI (Radix)
??? shared/             Hooks, utils e componentes compartilhados
??? stores/             useAuthStore (Zustand + localStorage)
??? App.tsx             Router raiz + provedores globais
??? index.css           CSS global + design tokens
??? main.tsx            Entry point
```

---

## Pasta `cli/` vs `scripts/`

| | `cli/` | `scripts/` |
| :--- | :--- | :--- |
| **Frequência** | Uso diário | Uso esporádico (1x ou raramente) |
| **Exemplos** | `phpstan.sh`, `phpcs.sh`, `db-reset.sh` | `setup.sh`, `deploy.sh`, `backup.sh` |

Documentação dos comandos CLI: [CLI.md](../ops/CLI.md)

---

## Pasta `documentation/`

Índice: [README.md](../README.md).

```
documentation/
├── README.md                 # Mapa de pastas
├── guias/                    # Regras de código (pastas, UI, nova feature)
├── stack/                    # Como o produto funciona (frontend, backend, auth…)
├── ops/                      # Docker, deploy, Makefile, CLI, lint
├── referencia/               # Visão global, árvore, padrões
└── progresso/
    ├── README.md             # Spec do formato + make progresso
    ├── ROADMAP.TEMPLATE.md   # Modelo do lote (copiar para a raiz)
    ├── PROGRESSO_ROADMAP.md  # Índice visual de todos os tópicos
    ├── PROGRESSO_ROADMAP_1.md
    └── melhorias/
```

Lote atual: `ROADMAP.md` na raiz. Guia de formato: [progresso/README.md](../progresso/README.md). Template: [ROADMAP.TEMPLATE.md](../progresso/ROADMAP.TEMPLATE.md).

---

## Como os Arquivos são Referenciados

```json
// package.json (npm scripts)
"dev": "vite --host --config .tooling/frontend/vite.config.js"
"type-check": "tsc --noEmit --project .tooling/frontend/tsconfig.json"
```

```bash
# cli/phpstan.sh
phpstan analyse --configuration=.tooling/quality/phpstan.neon

# Executar setup
bash scripts/setup.sh
```

---

**Atualizado em:** 9 de setembro de 2026 (v5)
