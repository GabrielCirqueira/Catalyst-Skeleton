# Docker e Orquestração

Este documento explica como a stack Docker está configurada e como executar o projeto. O ambiente garante paridade total entre desenvolvimento e produção.

## Serviços (`docker-compose.yaml`)

| Serviço | Imagem | Descrição |
| :--- | :--- | :--- |
| **`db`** | `mysql:8.3` | Banco de dados; porta, usuário e senha via `ports.env` e `.env` |
| **`symfony`** | `php:8.4` (imagem custom) | Apache (dev) / Nginx (prod); bootstrap inicial + Supervisord |
| **`vite-react`** | `node:20` | Dev server Vite com HMR; porta via `ports.env` |

### Container `symfony`

- **Bootstrap** (`devops/bootstrap.sh`): ajusta permissões de cache/logs e gera chaves JWT se necessário
- **Supervisord**: gerencia Apache (dev) / Nginx (prod) e workers
- Apache em dev (`devops/apache/000-default.conf`) — já tem as regras de rewrite para o `index.php`, sem dependência do `.htaccess`
- Se o módulo **`async`** estiver ativo, o Supervisord também gerencia o worker Messenger (`php bin/console messenger:consume async scheduler_default`)

## Dockerfile Multi-stage (`devops/php/Dockerfile`)

| Stage | Base | Conteúdo |
| :--- | :--- | :--- |
| `base` | `php:8.4-alpine` | Extensões essenciais: pdo_mysql, opcache, intl, zip |
| `dev` | `base` + Apache | Xdebug + ferramentas CLI (git, unzip) |
| `builder` | `base` + Composer | Instala dependências sem `--dev` |
| `prod` | `base` + Nginx | Copia output do `builder`; sem root, sem ferramentas dev |

## Fluxo de Inicialização (`make up-d`)

1. `db` sobe primeiro (healthcheck MySQL)
2. `symfony` e `vite-react` aguardam `db` estar pronto
3. `devops/bootstrap.sh` garante chaves RS256 para o JWT
4. Volumes nomeados mantêm dados do banco e caches entre reinícios

## Gestão de Portas (`ports.env`)

Todas as portas externas estão centralizadas em `ports.env`. Edite se houver conflito com outros projetos:

| Variável | Padrão | Acesso |
| :--- | :--- | :--- |
| `BACKEND_PORT` | `8080` | API Symfony |
| `FRONTEND_PORT` | `5173` | Dev server React |
| `DATABASE_HOST_PORT` | `3307` | MySQL Client externo |
| `SUPERVISOR_PORT` | `9001` | Painel Supervisord |

## Comandos Essenciais

```bash
make up-d      # Sobe a stack em background
make down      # Para e remove containers
make build     # Reconstrói imagens (após mudanças no Dockerfile)
make bash      # Shell no container symfony
make logs      # Logs de todos os containers (-f)
```
