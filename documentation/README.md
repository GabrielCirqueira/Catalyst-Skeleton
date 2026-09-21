# Documentação

Índice da documentação do Catalyst Skeleton. IA: comece por [guias/PARA-IA.md](guias/PARA-IA.md).

| Pasta | Para quê |
| :--- | :--- |
| [guias/](guias/) | Como o time (e a IA) deve escrever código: pastas, nomenclatura, UI, nova funcionalidade |
| [stack/](stack/) | Como o produto funciona hoje: frontend, backend, auth, testes, mensageria |
| [ops/](ops/) | Como operar o repositório: Docker, deploy, Makefile, CLI, lint |
| [referencia/](referencia/) | Visão global, árvore de pastas e padrões de arquitetura |
| [progresso/](progresso/) | Roadmap, índice de tópicos e melhorias pontuais |

## Guias (regras)

| Arquivo | Quando abrir |
| :--- | :--- |
| [guias/PARA-IA.md](guias/PARA-IA.md) | **Comece aqui.** Passo a passo de como escrever código neste repo |
| [guias/Estruturação.md](guias/Estruturação.md) | Detalhe: pastas, layout (`Box`/`Text`), checklist de PR |
| [guias/DESIGN.md](guias/DESIGN.md) | Tokens visuais e componentes de UI |
| [guias/NOVA-FUNCIONALIDADE.md](guias/NOVA-FUNCIONALIDADE.md) | Passo a passo longo para uma tela/feature nova |
| [guias/GUIA-GERAL.md](guias/GUIA-GERAL.md) | Compêndio longo de padrões (consulta, não o primeiro arquivo) |

## Stack

| Arquivo | Quando abrir |
| :--- | :--- |
| [stack/FRONTEND.md](stack/FRONTEND.md) | React, HeroUI, layout, rotas, TanStack Query |
| [stack/BACKEND.md](stack/BACKEND.md) | Symfony, DefaultController, services, DTOs |
| [stack/AUTH.md](stack/AUTH.md) | JWT, refresh, fluxo de login |
| [stack/MESSENGER.md](stack/MESSENGER.md) | Filas (módulo `async`) |

## Ops

| Arquivo | Quando abrir |
| :--- | :--- |
| [ops/DOCKER.md](ops/DOCKER.md) | Compose, imagens, portas |
| [ops/DEPLOY.md](ops/DEPLOY.md) | Produção |
| [ops/MAKEFILE.md](ops/MAKEFILE.md) | `make …` |
| [ops/CLI.md](ops/CLI.md) | Scripts em `cli/` |
| [ops/FORMATTING.md](ops/FORMATTING.md) | Biome e PHP-CS-Fixer |

## Referência

| Arquivo | Quando abrir |
| :--- | :--- |
| [referencia/DOCUMENTACAO_TECNICA.md](referencia/DOCUMENTACAO_TECNICA.md) | Enciclopédia: env, portas, versionamento |
| [referencia/STRUCTURE.md](referencia/STRUCTURE.md) | Árvore de diretórios do repositório |
| [referencia/ARCHITECTURE_PATTERNS.md](referencia/ARCHITECTURE_PATTERNS.md) | DDD, specifications, value objects |

## Progresso

Guia de formato e `make progresso`: [progresso/README.md](progresso/README.md).

O lote atual fica na raiz do repo: [ROADMAP.md](../ROADMAP.md).
