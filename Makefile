SHELL := /bin/bash

# --- CONFIGURAÇÕES DE USUÁRIO ---
DEV_UID := $(shell id -u)
DEV_GID := $(shell id -g)

# --- DIRETÓRIOS E ARQUIVOS ---
DEVOPS_DIR      ?= devops
CLI_DIR         ?= cli
SCRIPTS_DIR     ?= scripts
PUBLIC_DIR      ?= public
PORTS_ENV_FILE  ?= devops/ports.env
ENV_PROD_FILE   ?= .env
ENV_EXAMPLE_FILE ?= .tooling/env/.env.example

# --- DOCKER CONFIG ---
COMPOSE          ?= docker compose
COMPOSE_DEV_FILE ?= $(DEVOPS_DIR)/docker-compose.yaml
COMPOSE_PROD_FILE ?= $(DEVOPS_DIR)/docker-compose.prod.yaml

# --- COMANDOS DOCKER ---
COMPOSE_ENV      = DEV_UID=$(DEV_UID) DEV_GID=$(DEV_GID)
COMPOSE_DEV_CMD  = $(COMPOSE_ENV) $(COMPOSE) --env-file $(PORTS_ENV_FILE) -f $(COMPOSE_DEV_FILE)
COMPOSE_PROD_CMD = $(COMPOSE_ENV) $(COMPOSE) -f $(COMPOSE_PROD_FILE)

# --- EXECUÇÃO NOS CONTAINERS ---
EXEC_BACKEND  = $(COMPOSE_DEV_CMD) exec --user $(DEV_UID):$(DEV_GID) symfony
EXEC_FRONTEND = $(COMPOSE_DEV_CMD) exec --user $(DEV_UID):$(DEV_GID) vite-react
PROD_SYMFONY  = $(COMPOSE_PROD_CMD) exec -T symfony

.PHONY: help \
  build up up-d down restart rebuild pull-images \
  install install-backend install-frontend composer npm \
  lint-php lint-tsx lint-all fix-php fix-tsx fix-all phpstan check-naming \
  logs-backend logs-frontend logs-db logs-scheduler logs-all \
  bash-backend bash-frontend bash-db supervisor-shell \
  sf \
  doctrine-diff doctrine-validate doctrine-status doctrine-list doctrine-execute \
  migrate rollback db-create db-drop db-reset db-shell db-restore \
  cache-clear cache-warmup \
  routes debug-container debug-env debug-event \
  jwt-master \
  check-status fix-permissions \
  docker-clean system-info dev-logs monitor \
  deploy update-prod migrate-prod rollback-prod \
  prod-logs prod-logs-all prod-shell prod-status cache-clear-prod backup-db ssl-renew setup-prod-env \
  push progresso

help: ## Listar todos os comandos disponíveis
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-26s\033[0m %s\n", $$1, $$2}'

# ══════════════════════════════════════════════════
# CONTAINERS — Ciclo de vida
# ══════════════════════════════════════════════════

build: ## Rebuildar as imagens dos serviços
	$(COMPOSE_DEV_CMD) build

rebuild: ## Para containers, limpa volumes e rebuilda do zero
	$(COMPOSE_DEV_CMD) down --volumes --remove-orphans
	$(COMPOSE_DEV_CMD) build --no-cache
	$(COMPOSE_DEV_CMD) up -d --remove-orphans

pull-images: ## Baixar imagens base mais recentes
	$(COMPOSE_DEV_CMD) pull

up: ## Subir todos os serviços em modo attached
	$(COMPOSE_DEV_CMD) up

up-d: ## Subir todos os serviços em modo detached
	$(COMPOSE_DEV_CMD) up -d --remove-orphans

restart: ## Reiniciar o stack em modo detached
	$(COMPOSE_DEV_CMD) down --remove-orphans
	$(COMPOSE_DEV_CMD) up -d --remove-orphans

down: ## Parar e remover todos os serviços
	$(COMPOSE_DEV_CMD) down --remove-orphans

# ══════════════════════════════════════════════════
# DEPENDÊNCIAS
# ══════════════════════════════════════════════════

install: install-backend install-frontend ## Instalar dependências PHP e Node

install-backend: ## Instalar dependências Composer
	$(COMPOSE_DEV_CMD) run --rm --user $(DEV_UID):$(DEV_GID) --env HOME=/tmp/git-home symfony sh -lc 'mkdir -p "$$HOME" && git config --global --add safe.directory /var/www/html && composer install --no-interaction --prefer-dist'

install-frontend: ## Instalar dependências npm
	if [ -d node_modules ] && [ ! -w node_modules ]; then \
		$(COMPOSE_DEV_CMD) run --rm --user root:root vite-react sh -lc "rm -rf node_modules"; \
	fi
	if [ -d $(PUBLIC_DIR)/build ] && [ ! -w $(PUBLIC_DIR)/build ]; then \
		$(COMPOSE_DEV_CMD) run --rm --user root:root vite-react sh -lc "rm -rf $(PUBLIC_DIR)/build"; \
	fi
	$(COMPOSE_DEV_CMD) run --rm vite-react sh -lc "npm install --legacy-peer-deps"

composer: ## Executar comando composer arbitrário (ARGS="update")
	$(COMPOSE_DEV_CMD) run --rm --user $(DEV_UID):$(DEV_GID) --env HOME=/tmp/git-home symfony sh -lc 'mkdir -p "$$HOME" && git config --global --add safe.directory /var/www/html && composer $(ARGS)'

npm: ## Executar comando npm arbitrário (ARGS="run build")
	$(COMPOSE_DEV_CMD) run --rm vite-react npm $(if $(ARGS),$(ARGS),run build)

# ══════════════════════════════════════════════════
# QUALIDADE DE CÓDIGO
# ══════════════════════════════════════════════════

lint-php: ## Verificar estilo PHP (php-cs-fixer dry-run)
	$(EXEC_BACKEND) php vendor/bin/php-cs-fixer fix --dry-run --diff

lint-tsx: ## Lint TypeScript/React com Biome
	$(EXEC_FRONTEND) npx biome check web

lint-all: lint-php lint-tsx ## Executar todos os linters

fix-php: ## Corrigir automaticamente estilo PHP
	./$(CLI_DIR)/phpcbf.sh

fix-tsx: ## Corrigir automaticamente TypeScript/React
	$(EXEC_FRONTEND) npx biome check --write web

fix-all: ## Corrigir tudo (PHP e TSX)
	bash $(CLI_DIR)/fix-lint.sh

phpstan: ## Análise estática com PHPStan
	bash $(CLI_DIR)/phpstan.sh

check-naming: ## Verificar convenções de nomenclatura
	bash $(CLI_DIR)/check-naming.sh

# ══════════════════════════════════════════════════
# SYMFONY CONSOLE
# ══════════════════════════════════════════════════

sf: ## Executar comando Symfony console arbitrário (CMD="cache:clear")
	$(EXEC_BACKEND) php bin/console $(CMD)

cache-clear: ## Limpar cache e logs do ambiente de desenvolvimento
	bash $(CLI_DIR)/cache-clear.sh

cache-warmup: ## Aquecer o cache do Symfony
	$(EXEC_BACKEND) php bin/console cache:warmup

routes: ## Listar todas as rotas da aplicação
	$(EXEC_BACKEND) php bin/console debug:router

debug-container: ## Inspecionar serviços do container DI (SERVICE="App\Service\Foo")
	$(EXEC_BACKEND) php bin/console debug:container $(SERVICE)

debug-env: ## Listar variáveis de ambiente reconhecidas pelo Symfony
	$(EXEC_BACKEND) php bin/console debug:dotenv

debug-event: ## Listar todos os event listeners registrados
	$(EXEC_BACKEND) php bin/console debug:event-dispatcher

# ══════════════════════════════════════════════════
# DOCTRINE — Migrations e Schema
# ══════════════════════════════════════════════════

doctrine-diff: ## Gerar migration com base nas diferenças do schema (doctrine:migrations:diff)
	$(EXEC_BACKEND) php bin/console doctrine:migrations:diff

doctrine-validate: ## Validar o mapeamento ORM vs banco de dados
	$(EXEC_BACKEND) php bin/console doctrine:schema:validate

doctrine-status: ## Exibir status das migrations (executadas / pendentes)
	$(EXEC_BACKEND) php bin/console doctrine:migrations:status

doctrine-list: ## Listar todas as migrations e seus estados
	$(EXEC_BACKEND) php bin/console doctrine:migrations:list

doctrine-execute: ## Executar uma migration específica (VERSION="20260315043928")
	$(EXEC_BACKEND) php bin/console doctrine:migrations:execute --up $(VERSION)

migrate: ## Executar todas as migrations pendentes
	$(EXEC_BACKEND) php bin/console doctrine:migrations:migrate --no-interaction

rollback: ## Reverter para a migration anterior
	$(EXEC_BACKEND) php bin/console doctrine:migrations:migrate prev --no-interaction

db-create: ## Criar o banco de dados (se não existir)
	$(EXEC_BACKEND) php bin/console doctrine:database:create --if-not-exists

db-drop: ## Remover o banco de dados (CUIDADO: destrói todos os dados)
	$(EXEC_BACKEND) php bin/console doctrine:database:drop --force --if-exists

db-reset: ## Resetar banco: drop, create, migrate (ambiente dev)
	bash $(CLI_DIR)/db-reset.sh

db-shell: ## Abrir shell MySQL dentro do container
	bash $(SCRIPTS_DIR)/db-shell.sh

db-restore: ## Restaurar backup SQL (ARGS="arquivo.sql")
	bash $(SCRIPTS_DIR)/db-restore.sh $(if $(ARGS),$(ARGS),"")

# ══════════════════════════════════════════════════
# JWT / SEGURANÇA
# ══════════════════════════════════════════════════

jwt-master: ## Gerar token JWT com acesso total (Master)
	bash $(CLI_DIR)/jwt-full-access.sh

# ══════════════════════════════════════════════════
# SHELLS E ACESSO AOS CONTAINERS
# ══════════════════════════════════════════════════

bash-backend: ## Abrir shell bash no container symfony
	$(EXEC_BACKEND) bash

bash-frontend: ## Abrir shell no container vite-react
	$(EXEC_FRONTEND) sh

bash-db: ## Abrir shell no container do banco de dados
	$(COMPOSE_DEV_CMD) exec database bash

supervisor-shell: ## Abrir shell no container do supervisor
	$(COMPOSE_DEV_CMD) exec supervisor sh

# ══════════════════════════════════════════════════
# LOGS
# ══════════════════════════════════════════════════

logs-backend: ## Ver logs do backend (symfony)
	$(COMPOSE_DEV_CMD) logs -f symfony

logs-frontend: ## Ver logs do frontend (vite-react)
	$(COMPOSE_DEV_CMD) logs -f vite-react

logs-db: ## Ver logs do banco de dados
	$(COMPOSE_DEV_CMD) logs -f database

logs-scheduler: ## Ver logs do scheduler/supervisor
	$(COMPOSE_DEV_CMD) logs -f supervisor

logs-all: ## Ver logs de todos os serviços
	$(COMPOSE_DEV_CMD) logs -f

dev-logs: ## Menu interativo de logs (script)
	bash $(SCRIPTS_DIR)/logs-dev.sh

# ══════════════════════════════════════════════════
# DIAGNÓSTICO E MANUTENÇÃO
# ══════════════════════════════════════════════════

check-status: ## Verificar saúde dos serviços
	bash $(CLI_DIR)/check-status.sh

fix-permissions: ## Corrigir permissões de arquivos e pastas (permission denied após git pull, docker, etc.)
	@# 1. Primeiro: devolve a posse de tudo ao usuário atual (Docker cria arquivos como root)
	@echo "→ Recuperando propriedade dos arquivos (sudo necessário)..."
	@sudo chown -R $(DEV_UID):$(DEV_GID) . 2>/dev/null || \
		echo "  ⚠  sudo não disponível — tente: sudo chown -R $$(id -u):$$(id -g) ."
	@# 2. Diretórios — rwxr-xr-x
	@echo "→ Ajustando permissões de diretórios e arquivos..."
	@find . -not -path "./.git/*" -not -path "./vendor/*" -not -path "./node_modules/*" \
		-type d -exec chmod 755 {} \;
	@# 3. Arquivos comuns — rw-r--r--
	@find . -not -path "./.git/*" -not -path "./vendor/*" -not -path "./node_modules/*" \
		-type f ! -name "*.sh" -exec chmod 644 {} \;
	@# 4. Scripts — devem ser executáveis
	@find cli scripts -type f -name "*.sh" -exec chmod +x {} \;
	@find cli -type f ! -name "*.sh" -exec chmod +x {} \;
	@# 5. var/ — o container Symfony precisa escrever cache e logs
	@chmod -R 777 var/
	@# 6. config/jwt/ — apenas o dono lê (chaves privadas)
	@chmod -R 700 config/jwt/
	@echo "✓ Permissões corrigidas"

docker-clean: ## Remover recursos Docker não utilizados (prune)
	bash $(SCRIPTS_DIR)/docker-clean.sh

system-info: ## Informações do sistema e uso de recursos Docker
	bash $(SCRIPTS_DIR)/system-info.sh

monitor: ## Monitoramento detalhado do ambiente local
	bash $(SCRIPTS_DIR)/monitor.sh

# ══════════════════════════════════════════════════
# PRODUÇÃO
# ══════════════════════════════════════════════════

deploy: ## Build e deploy em produção
	bash $(SCRIPTS_DIR)/deploy.sh

update-prod: ## Atualizar ambiente de produção
	bash $(SCRIPTS_DIR)/update.sh

migrate-prod: ## Executar migrations em produção
	$(PROD_SYMFONY) php bin/console doctrine:migrations:migrate --no-interaction --env=prod

rollback-prod: ## Reverter última migration em produção
	$(PROD_SYMFONY) php bin/console doctrine:migrations:migrate prev --no-interaction --env=prod

prod-logs: ## Monitorar logs de produção (básico)
	$(COMPOSE_PROD_CMD) logs -f --tail=100

prod-logs-all: ## Monitorar logs de produção (script completo)
	bash $(SCRIPTS_DIR)/logs-prod.sh

prod-shell: ## Abrir shell no symfony de produção
	$(COMPOSE_PROD_CMD) exec symfony sh

prod-status: ## Listar containers de produção e status
	$(COMPOSE_PROD_CMD) ps

cache-clear-prod: ## Limpar cache de produção
	$(PROD_SYMFONY) php bin/console cache:clear --env=prod

backup-db: ## Gerar backup do banco com rotação
	bash $(SCRIPTS_DIR)/backup.sh

ssl-renew: ## Renovar certificados SSL
	$(COMPOSE_PROD_CMD) run --rm certbot renew
	$(COMPOSE_PROD_CMD) exec nginx nginx -s reload

setup-prod-env: ## Criar .env de produção a partir do exemplo
	@test -f $(ENV_PROD_FILE) || (cp .tooling/env/.env.prod.example $(ENV_PROD_FILE) && echo "⚠️  Configure o $(ENV_PROD_FILE) antes de continuar!")

push: ## Commitar e enviar alterações para o repositório remoto (ARGS="mensagem")
	git add .
	git commit -m "$(if $(ARGS),$(ARGS),feat: updates)"
	git push

# ══════════════════════════════════════════════════
# PROGRESSO / ROADMAP
# ══════════════════════════════════════════════════

progresso: ## Sincronizar ROADMAP.md com documentation/progresso/
	python3 $(SCRIPTS_DIR)/update_roadmap.py
