# 🚀 Catalyst Skeleton v5.0.0 — Symfony 7.3 & React 19

**O ponto de partida definitivo para aplicações empresariais sólidas, escaláveis e resilientes.**

Catalyst Skeleton é uma suite completa de engenharia que impõe padrões de **Clean Architecture**, **DDD** e **SOLID**. Backend PHP 8.4 + Symfony 7.3 com JSON API. Frontend React 19 + TypeScript como SPA. Tudo containerizado, production-ready desde o primeiro commit.

---

## 📅 Histórico de Versões

O roadmap do Catalyst Skeleton é focado em estabilidade e modernização constante da stack.

| Versão | Data de Lançamento | Destaque Principal |
| :--- | :--- | :--- |
| **Skeleton V5** | 9 de setembro 2026 | **Atual** — Núcleo enxuto + módulos opt-in. Rotas padronizadas `/api/v1/`. |
| **Skeleton V4** | 23 de março 2026 | Estável — Symfony 7.3, React 19, Biome. |
| **Skeleton V3** | 6 de outubro 2025 | Estabilização de Message Bus e Workers. |
| **Skeleton V2** | 1 de junho 2025 | Introdução de Shadcn UI e Lucide Icons. |
| **Skeleton V1** | 30 de janeiro 2025 | Release inicial (Symfony 6.4 + React 18). |

---

> Índice da documentação: [documentation/README.md](documentation/README.md). Visão técnica global: [DOCUMENTACAO_TECNICA.md](documentation/referencia/DOCUMENTACAO_TECNICA.md).

---

## Pré-requisitos

| Ferramenta | Verificação |
| :--- | :--- |
| Docker + Docker Compose v2 | `docker compose version` |
| Git | `git --version` |
| OpenSSL | `openssl version` |

> Node.js e PHP não precisam estar instalados na máquina host.

---

## 🛠️ Setup Inicial (The Magic Script)

O Catalyst Skeleton possui um orquestrador de setup altamente sofisticado que prepara todo o seu ambiente profissional em minutos.

```bash
bash scripts/setup.sh
```

### O que o setup faz por você:

1. **Personalização**: Renomeia o projeto em todos os arquivos (`package.json`, namespaces, banners).
2. **Gestão de Portas**: Permite configurar portas customizadas para evitar conflitos locais.
3. **Segurança Máxima**: Gera segredos aleatórios (`APP_SECRET`, `JWT_PASSPHRASE`) e senhas únicas de banco.
4. **Ambiente Isolado**: Cria seu arquivo `.env` configurado com DSNs e URLs corretos.
5. **Orquestração Docker**: Realiza o build multi-stage e sobe os containers de forma resiliente.
6. **Instalação de Deps**: Instala dependências PHP (Composer) e JS (NPM) dentro do ambiente isolado.
7. **Criptografia**: Gera o par de chaves **RS256** (pública/privada) para o subsistema de JWT.
8. **Sincronização**: Aguarda o banco estar pronto e executa as Migrations automaticamente.
9. **Health Check**: Valida a saúde final da API antes de declarar o sucesso do setup.

---

| Serviço | Porta (Host) | Destino |
| :--- | :--- | :--- |
| **API Symfony** | `BACKEND_PORT` | [http://localhost:4355](http://localhost:4355) |
| **Frontend Vite** | `FRONTEND_PORT` | [http://localhost:3453](http://localhost:3453) |
| **MySQL** | `DATABASE_PORT` | `localhost:2345` |
| **Supervisor** | `SUPERVISOR_PORT` | [http://localhost:1011](http://localhost:1011) |

> [!TIP]
> As portas são centralizadas no arquivo `ports.env`. O setup pergunta quais você deseja usar, mas você pode alterá-las a qualquer momento e rodar `make restart`.

---

---

## 🛠️ Comandos do dia a dia

| Comando | Descrição |
| :--- | :--- |
| `make up-d` | Sobe a stack completa em background |
| `make down` | Para todos os containers |
| `make restart` | Reinicia todos os serviços |
| `make install` | Instala dependências (Composer + NPM) |
| `make migrate` | Executa migrations pendentes |
| `make lint-all` | Valida estilo (PHP-CS-Fixer + Biome) |
| `make bash-backend` | Acessa shell do container Symfony |

---

## 🏗️ Arquitetura (Visão Rápida)

O Catalyst Skeleton impõe uma separação rigorosa de interesses:

- **Backend**: Baseado em **Services Atômicos** e **DTOs**. A lógica de negócio nunca vaza para o Controller.
- **Frontend**: Organizado por **Features**. Cada funcionalidade (Auth, User, etc) é um módulo autossucedido.
- **Envelope da API**: Controllers de API extends `DefaultController` e respondem `{ success, data }` / `{ success, error }`.

---

## 📚 Documentação Detalhada

Para uma imersão profunda em cada área do projeto, consulte nossos guias específicos:

- [**Índice**](documentation/README.md): mapa de pastas (`guias/`, `stack/`, `ops/`, `referencia/`, `progresso/`).
- [**Progresso e Roadmap**](documentation/progresso/README.md): índices paginados e `make progresso`.
- [**Guia de Autenticação**](documentation/stack/AUTH.md): Fluxo JWT, RS256 e Auto-refresh.
- [**Guia de Frontend**](documentation/stack/FRONTEND.md): React 19, HeroUI v3 e primitivos de layout.
- [**Guia de Backend**](documentation/stack/BACKEND.md): Symfony 7.3, `DefaultController` e Early Return.
- [**Arquitetura e Padrões**](documentation/referencia/ARCHITECTURE_PATTERNS.md): DDD, Specifications e Value Objects.
- [**Mensageria (Async)**](documentation/stack/MESSENGER.md): Symfony Messenger e Workers.
- [**Docker e DevOps**](documentation/ops/DOCKER.md): Infraestrutura e multi-stage builds.
- [**Makefile e CLI**](documentation/ops/MAKEFILE.md): Comandos de produtividade e Scaffolding.
- [**Lint e Formatação**](documentation/ops/FORMATTING.md): Biome e PHP-CS-Fixer.

---

## 🚀 Produção e DevOps

Desenvolvido para ser *Production Ready*:
- **Deploy**: Script `devops/deploy.sh` com zero-downtime aproximado e healthchecks.
- **Segurança**: Nginx configurado com TLS 1.3 e headers de segurança (HSTS, CSP).
- **Monitoramento**: Painel Supervisor para gestão de workers e logs estruturados.

---

*Para uma visão técnica global e variáveis de ambiente, veja [DOCUMENTACAO_TECNICA.md](documentation/referencia/DOCUMENTACAO_TECNICA.md).*
