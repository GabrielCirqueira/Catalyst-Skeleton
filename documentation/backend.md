# Backend (Symfony)

Este documento descreve a API/backend Symfony.

## Tecnologias
- PHP 8.4 (no container) / Symfony 7.3
- Doctrine ORM + Migrations
- Console (comandos personalizados)
- Pentatrion Vite Bundle (injeção de assets Vite em Twig)

## Estrutura
- `src/Controller/DefaultController.php`: controladores HTTP (atributos/annotations).
- `src/Command/CronHeartbeatCommand.php`: comando de console que escreve batimentos em `/var/log/cron/command.log`.
- `src/Kernel.php`: boot da aplicação.
- `config/`: configuração do framework, bundles e rotas.
- `templates/base.html.twig`: shell HTML que injeta assets Vite via `vite_entry_*`.
- `public/index.php`: front-controller.

## Rotas
- `config/routes.yaml`:
  - Carrega controllers via atributos em `src/Controller`.
  - Captura qualquer caminho para renderizar `templates/base.html.twig` (SPA React), permitindo roteamento no frontend.

## Console / Cron
- Comando: `bin/console app:cron:heartbeat`.
- `docker/crontab` agenda execução horária dentro do container backend, gerenciado pelo `supervisord`.

## Banco de Dados
- `docker-compose.yaml` define `mysql:8.3` com credenciais padrão (arquivo `ports.env` centraliza as portas).
- Ajuste `config/packages/doctrine.yaml` conforme suas credenciais/URL.
- Comandos úteis:
  - Migrations: `bin/console doctrine:migrations:diff` / `migrate`.
  - Entidades: `maker` bundle (se instalado) pode gerar entidades/controllers.

## Execução
- Local com Docker: `make up-d` e acesse o backend via porta `BACKEND_PORT` em `ports.env`.
- Logs: `make logs-backend` e `make logs-scheduler` (cron/supervisor).
- Shell: `make bash-backend` abre shell no container Symfony.

## Qualidade de código
- PHPStan: `./cli/phpstan.sh` (ou `composer lint:php:stan`).
- PHPCS: `./cli/phpcs.sh src tests`.
- PHPCBF (auto-fix): `./cli/phpcbf.sh` ou `./cli/phpcbf-diff.sh`.
- Hook Git: `./cli/install-hooks.sh` instala `pre-commit` para rodar QA automaticamente.

Observação: em hosts com PHP < 8.4, os scripts já ignoram o platform-check para permitir rodar QA localmente; no container, usa PHP 8.4.

