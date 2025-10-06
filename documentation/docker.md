# Docker e Orquestração

Este documento explica como a stack Docker está configurada e como executar.

## Serviços (docker-compose.yaml)
- `database` (MySQL 8.3)
  - Usuário/senha/db: `skeleton` (padrão).
  - Portas publicadas via `ports.env` (`DATABASE_HOST_PORT` → `DATABASE_CONTAINER_PORT`).
  - Volume `db_data` persiste os dados.

- `symfony` (PHP 8.4 + Apache)
  - Build do `Dockerfile` (detalhes abaixo).
  - Monta o projeto em `/var/www/html` (volume bind).
  - Expõe 80 (HTTP) e 9001 (Supervisor UI), mapeados conforme `ports.env`.
  - Depende de `database` e inicia via `wait-for-db.sh` + `docker/bootstrap.sh` + `supervisord`.

- `vite-react` (Node 20)
  - Build de `docker/vite.Dockerfile` (pina o npm).
  - Executa `npm install --legacy-peer-deps && npm run dev`.
  - Expõe a porta `FRONTEND_PORT` (HMR), definida em `ports.env`.
  - Depende de `symfony` (para que os assets/tags estejam disponíveis).

## Dockerfile (backend)
- Base: `php:8.4-apache`.
- Instala extensões: `pdo`, `pdo_mysql`, `intl`, `opcache`.
- Copia Composer do container oficial.
- Copia o projeto e roda `composer install` (com `APP_ENV=test` para evitar `cache:clear`).
- Ajusta permissões de `var/`.
- Gera chaves em `config/jwt` (exemplo com senha `jwtpass`).
- Copia config do Apache, ativa `rewrite` e `headers`.
- Configura `cron` via `docker/crontab` e `supervisord` para gerenciar Apache e Cron.

## Fluxo de inicialização
1. `wait-for-db.sh database true`: espera o MySQL aceitar conexões.
2. `docker/bootstrap.sh`: script de bootstrap (ajustes de app/cache, etc.).
3. `supervisord -n`: sobe Apache e Cron (vide `supervisord.conf`).

## Portas
Centralizadas em `ports.env`:
- `BACKEND_PORT` (HTTP Apache)
- `SUPERVISOR_PORT` (painel web do supervisord)
- `FRONTEND_PORT` (Vite dev server)
- `DATABASE_HOST_PORT` / `DATABASE_CONTAINER_PORT` (MySQL)

## Comandos úteis
- Subir stack: `make up-d`
- Derrubar: `make down`
- Logs: `make logs-backend`, `make logs-frontend`, `make logs-scheduler`
- Shell: `make bash-backend`, `make bash-frontend`

