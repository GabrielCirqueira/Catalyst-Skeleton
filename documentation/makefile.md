# Makefile (comandos)

Este documento descreve os alvos do `Makefile` para facilitar o dia a dia com Docker.

Execute `make help` para ver a lista. Principais alvos:

- `build`: build/rebuild das imagens dos serviços.
- `up`: sobe todos os serviços em modo anexado (logs na tela).
- `up-d`: sobe em modo detached (em background).
- `restart`: reinicia a stack (down + up -d).
- `down`: para e remove os serviços.

- `install`: roda `composer install` (backend) e `npm install` (frontend) via containers.
- `install-backend`: instala dependências PHP dentro do container Symfony.
- `install-frontend`: instala dependências NPM dentro do container Vite.
- `composer ARGS=...`: executa composer com argumentos arbitrários no container.
- `npm ARGS=...`: executa `npm` no container `vite-react`.

- `lint-php`: roda PHP-CS-Fixer no backend (container).
- `lint-tsx`: roda ESLint no frontend (container) com `--fix`.
- `lint-all`: roda ambos.

- `fix-php`: roda `cli/phpcbf.sh` localmente (PHPCBF via container) para `src` e `tests`.
- `fix-php-diff ARGS=...`: corrige apenas arquivos PHP alterados (usa `git diff`).

- `logs-backend`: segue logs do container Symfony (Apache etc.).
- `logs-frontend`: segue logs do container Vite.
- `logs-scheduler`: segue logs (supervisor/cron) do container Symfony.

- `bash-backend`: abre shell no container Symfony.
- `bash-frontend`: abre shell no container Vite.
- `supervisor-shell`: shell no mesmo container (útil para ver/gerenciar processos sob supervisord).

