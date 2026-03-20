# 🚀 Catalyst Skeleton — Symfony 7.3 & React 19

**O ponto de partida definitivo para aplicações empresariais sólidas, escaláveis e resilientes.**

Catalyst Skeleton é uma suite completa de engenharia que impõe padrões de **Clean Architecture**, **DDD** e **SOLID**. Backend PHP 8.4 + Symfony 7.3 com JSON API. Frontend React 19 + TypeScript como SPA. Tudo containerizado, production-ready desde o primeiro commit.

> Para documentação técnica detalhada (arquitetura, variáveis de ambiente, DevOps, deploy, logs, etc.) consulte [DOCUMENTACAO_TECNICA.md](DOCUMENTACAO_TECNICA.md).

---

## Pré-requisitos

| Ferramenta | Verificação |
| :--- | :--- |
| Docker + Docker Compose v2 | `docker compose version` |
| Git | `git --version` |
| OpenSSL | `openssl version` |

> Node.js e PHP não precisam estar instalados na máquina host.

---

## Setup (execute 1x após clonar)

```bash
bash setup.sh
```

O script faz tudo automaticamente: renomeia o projeto, gera segredos (`APP_SECRET`, `JWT_PASSPHRASE`, senhas do banco), cria o `.env`, faz o build dos containers, instala dependências PHP e JS, gera as chaves JWT e roda as migrations.

---

## Serviços após o setup

| Serviço | URL padrão |
| :--- | :--- |
| API Symfony | http://localhost:1010 |
| Frontend Vite (HMR) | http://localhost:1012 |
| MySQL (host) | localhost:1013 |
| Supervisor (painel) | http://localhost:1011 |

> As portas são configuradas em `ports.env`. Altere lá para mudar tudo de uma vez.

---

## Comandos do dia a dia

```bash
make up-d          # sobe tudo em background
make down          # para tudo
make restart       # down + up-d
make install       # instala deps PHP e JS nos containers
make migrate       # roda migrations pendentes
make new-migration # gera migration a partir do diff do schema
make test          # roda PHPUnit (Unit + Integration)
make lint-all      # PHP-CS + Biome
make fix-php       # auto-fix PHP
make fix-tsx       # auto-fix TypeScript/React
make bash-backend  # shell no container symfony
make logs-backend  # tail dos logs do backend
```

---

## Arquitetura (visão rápida)

**Backend** — cada camada tem uma única responsabilidade:

| Camada | Pasta | Regra |
| :--- | :--- | :--- |
| Entidades | `src/Entity/` | PK UUID v7, sem getters/setters anêmicos |
| Repositórios | `src/Repository/` | Único lugar onde se usa o `EntityManager` |
| Services | `src/Service/` | Um service = uma ação — método `executar()` |
| DTOs | `src/DataObject/` | Entrada validada antes de chegar no domínio |
| Serializers | `src/Serializer/` | Contrato JSON de saída — protege o frontend |
| Controllers | `src/Controller/` | Lógica zero — orquestra entrada e saída |

**Frontend** — arquitetura baseada em features:

| Pasta | Responsabilidade |
| :--- | :--- |
| `web/features/` | Módulos autossuficientes (ex: `auth/`) |
| `web/shared/` | Componentes, hooks e utils globais |
| `web/stores/` | Estado global com Zustand |
| `web/config/api.ts` | Instância Axios centralizada com auto-refresh JWT |
| `web/routes/` | Guards de rota (`RotaProtegida`) |
| `web/shadcn/` | Componentes Shadcn/Radix UI prontos |

---

## Scaffolding

```bash
./cli/new-feature.sh
```

Informe o nome em PascalCase (ex: `Produto`). Gera automaticamente: Entity, Repository, Controller, DTO, Service e os arquivos de feature no frontend.

---

## Qualidade de código

```bash
./cli/run-qa.sh    # PHPStan + PHPCS + Biome em sequência
composer qa        # mesmo comando
```

Git hooks automáticos via Husky: **lint-staged** no pre-commit e **Commitlint** validando a mensagem. Formato obrigatório:

```
feat: descrição curta
fix: corrige algo
refactor: melhora sem mudar comportamento
```

---

## Produção

```bash
bash devops/deploy.sh    # primeiro deploy (build do zero + rollback automático)
bash devops/update.sh    # updates (rebuild inteligente + rollback automático)
bash devops/backup.sh    # backup do banco com rotação de 7 dias
bash devops/monitor.sh   # verifica containers e alerta no Slack/Discord
bash devops/logs-prod.sh # visualizador interativo de logs de produção
```

Stack de produção: **Nginx** (TLS 1.2/1.3) → **PHP-FPM** (imagem Alpine sem Xdebug, OPcache ativo) → **MySQL 8.3** + **Certbot** para SSL automático.

---

*Para detalhes completos sobre stack, variáveis de ambiente, autenticação, mensageria, segurança, DevOps e padrões de nomenclatura, veja [DOCUMENTACAO_TECNICA.md](DOCUMENTACAO_TECNICA.md).*
