# Docker e Orquestração

Este documento explica como a stack Docker está configurada e como executar. O projeto utiliza containers isolados para garantir paridade total entre os ambientes de desenvolvimento e produção.

## Serviços (`docker-compose.yaml`)
- **`db`** (`mysql:8.3`):
  - Chaves de acesso: `DB_USER`, `DB_PASSWORD`, `DB_DATABASE` em `.env`.
  - Porta exposta via `ports.env` (`DATABASE_HOST_PORT`).
  - Persistência: volume `db_data`.
- **`symfony`** (`php:8.4-fpm-alpine`):
  - Engine: Nginx (produção) / Apache (desenvolvimento).
  - Inicia via `docker/bootstrap.sh`: ajusta permissões de cache e logs, e gera chaves JWT se necessário.
  - Orquestrador de processos: **Supervisord** mapeado para gerenciar PHP-FPM e Workers Messenger.
  - Porta exposta via `ports.env` (`BACKEND_PORT`).
- **`vite-react`** (`node:20`):
  - Instala dependências e roda `npm run dev` apontando para o host via HMR.
  - Porta exposta via `ports.env` (`FRONTEND_PORT`).
  - Integração: utiliza `vite-plugin-symfony` para injeção nativa de assets.

## Dockerfile Multi-stage (`docker/php/Dockerfile`)
A imagem de PHP é construída em camadas para otimizar o tamanho e segurança:
1. **`base`**: PHP 8.4 + extensões essenciais (pdo_mysql, opcache, intl, zip).
2. **`dev`**: `base` + Xdebug + ferramentas de CLI (git, unzip). Modo Apache.
3. **`builder`**: `base` + Composer. Executa o build de dependências sem `--dev`.
4. **`prod`**: `base` + Nginx. Copia apenas o necessário do `builder` e bloqueia acesso root.

## Fluxo de Inicialização
Ao rodar `make up-d`, o Docker segue esta ordem:
1. **Verificação de dependências**: `vite-react` e `symfony` aguardam o container `db` estar pronto para conexões.
2. **Bootstrap**: O script `docker/bootstrap.sh` é disparado, garantindo que as chaves RS256 para o JWT Auth estejam presentes no diretório `config/jwt`.
3. **Persistência**: Volumes nomeados garantem que os dados do banco e caches não sejam perdidos ao derrubar a stack.

## Gestão de Portas (`ports.env`)
Todas as portas externas são centralizadas no arquivo `ports.env`. Edite este arquivo se houver conflitos com outros projetos locais:
- `BACKEND_PORT`: Porta host para acessar a API Symfony.
- `FRONTEND_PORT`: Porta host para visualizar o frontend React (dev server).
- `DATABASE_HOST_PORT`: Porta host para conexões externas via MySQL Client.
- `SUPERVISOR_PORT`: Painel administrativo de processos.

## Comandos Essenciais
- **Limpar tudo**: `make down` (remove containers).
- **Recriar imagens**: `make build` (após alterações no logic da Dockerfile).
- **Logs globais**: `docker compose logs -f`.
