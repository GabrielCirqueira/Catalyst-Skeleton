SHELL := /bin/bash

# --- CONFIGURAÇÕES DE USUÁRIO ---
DEV_UID := $(shell id -u)
DEV_GID := $(shell id -g)

# --- DIRETÓRIOS E ARQUIVOS ---
DOCKER_DIR      ?= docker
CLI_DIR         ?= cli
DEVOPS_DIR      ?= devops
PUBLIC_DIR      ?= public
PORTS_ENV_FILE  ?= ports.env
ENV_PROD_FILE   ?= .env
ENV_EXAMPLE_FILE ?= .env.example

# --- DOCKER CONFIG ---
COMPOSE          ?= docker compose
COMPOSE_DEV_FILE ?= $(DOCKER_DIR)/docker-compose.yaml
COMPOSE_PROD_FILE ?= $(DOCKER_DIR)/docker-compose.prod.yaml

# --- COMANDOS DOCKER ---
COMPOSE_ENV      = DEV_UID=$(DEV_UID) DEV_GID=$(DEV_GID)
COMPOSE_DEV_CMD  = $(COMPOSE_ENV) $(COMPOSE) --env-file $(PORTS_ENV_FILE) -f $(COMPOSE_DEV_FILE)
COMPOSE_PROD_CMD = $(COMPOSE_ENV) $(COMPOSE) -f $(COMPOSE_PROD_FILE)

# --- EXECUÇÃO NOS CONTAINERS ---
EXEC_BACKEND  = $(COMPOSE_DEV_CMD) exec --user $(DEV_UID):$(DEV_GID) symfony
EXEC_FRONTEND = $(COMPOSE_DEV_CMD) exec --user $(DEV_UID):$(DEV_GID) vite-react
PROD_SYMFONY  = $(COMPOSE_PROD_CMD) exec -T symfony

.PHONY: help build up up-d down restart install install-backend install-frontend composer npm lint-php lint-tsx lint-all fix-php fix-tsx fix-php-diff logs-backend logs-frontend logs-scheduler bash-backend bash-frontend supervisor-shell test test-unit test-integration test-coverage

help: ## List available commands
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "%-24s %s\n", $$1, $$2}'

# --- FLUXO DE DESENVOLVIMENTO ---
build: ## Build or rebuild service images
	$(COMPOSE_DEV_CMD) build

up: ## Start all services in attached mode
	$(COMPOSE_DEV_CMD) up

up-d: ## Start all services in detached mode
	$(COMPOSE_DEV_CMD) up -d --remove-orphans

restart: ## Restart the stack in detached mode
	$(COMPOSE_DEV_CMD) down --remove-orphans
	$(COMPOSE_DEV_CMD) up -d --remove-orphans

down: ## Stop and remove all services
	$(COMPOSE_DEV_CMD) down --remove-orphans

install: install-backend install-frontend ## Install PHP and Node dependencies

install-backend: ## Install composer deps (with git safe.directory)
	$(COMPOSE_DEV_CMD) run --rm --user $(DEV_UID):$(DEV_GID) --env HOME=/tmp/git-home symfony sh -lc 'mkdir -p "$$HOME" && git config --global --add safe.directory /var/www/html && composer install --no-interaction --prefer-dist'

install-frontend: ## Install npm dependencies without root issues
	if [ -d node_modules ] && [ ! -w node_modules ]; then \
		$(COMPOSE_DEV_CMD) run --rm --user root:root vite-react sh -lc "rm -rf node_modules"; \
	fi
	if [ -d $(PUBLIC_DIR)/build ] && [ ! -w $(PUBLIC_DIR)/build ]; then \
		$(COMPOSE_DEV_CMD) run --rm --user root:root vite-react sh -lc "rm -rf $(PUBLIC_DIR)/build"; \
	fi
	$(COMPOSE_DEV_CMD) run --rm vite-react sh -lc "npm install --legacy-peer-deps"

composer: ## Run an arbitrary composer command (ARGS="update")
	$(COMPOSE_DEV_CMD) run --rm --user $(DEV_UID):$(DEV_GID) --env HOME=/tmp/git-home symfony sh -lc 'mkdir -p "$$HOME" && git config --global --add safe.directory /var/www/html && composer $(ARGS)'

npm: ## Run an arbitrary npm command (ARGS="run build")
	$(COMPOSE_DEV_CMD) run --rm vite-react npm $(if $(ARGS),$(ARGS),run build)

lint-php: ## Check PHP code style
	$(EXEC_BACKEND) php vendor/bin/php-cs-fixer fix --dry-run --diff

lint-tsx: ## Lint and format TypeScript/React with Biome
	$(EXEC_FRONTEND) npx biome check web

lint-all: lint-php lint-tsx ## Run all linters

fix-php: ## Auto-fix PHP CS issues
	./$(CLI_DIR)/phpcbf.sh

fix-tsx: ## Auto-fix TypeScript/React issues
	$(EXEC_FRONTEND) npx biome check --write web

logs-backend: ## Tail backend logs
	$(COMPOSE_DEV_CMD) logs -f symfony

logs-frontend: ## Tail frontend logs
	$(COMPOSE_DEV_CMD) logs -f vite-react

bash-backend: ## Open a Bash shell in symfony container
	$(EXEC_BACKEND) bash

bash-frontend: ## Open a shell in vite-react container
	$(EXEC_FRONTEND) sh

# --- TESTES ---
test: ## Run all test suites
	$(EXEC_BACKEND) php vendor/bin/phpunit

test-unit: ## Run only unit tests
	$(EXEC_BACKEND) php vendor/bin/phpunit --testsuite Unit

test-integration: ## Run only integration tests
	$(EXEC_BACKEND) php vendor/bin/phpunit --testsuite Integration

# --- BANCO DE DADOS ---
new-migration: ## Generate a new Doctrine migration
	$(EXEC_BACKEND) php bin/console doctrine:migrations:diff

migrate: ## Run Doctrine migrations local
	$(EXEC_BACKEND) php bin/console doctrine:migrations:migrate --no-interaction

rollback: ## Revert to previous migration version local
	$(EXEC_BACKEND) php bin/console doctrine:migrations:migrate prev --no-interaction

# --- PRODUÇÃO ---
deploy: ## Build images and deploy in production
	$(COMPOSE_PROD_CMD) build
	$(COMPOSE_PROD_CMD) up -d --remove-orphans
	$(PROD_SYMFONY) php bin/console doctrine:migrations:migrate --no-interaction --env=prod
	$(PROD_SYMFONY) php bin/console cache:clear --env=prod

migrate-prod: ## Run migrations in production
	$(PROD_SYMFONY) php bin/console doctrine:migrations:migrate --no-interaction --env=prod

rollback-prod: ## Revert the last migration in production
	$(PROD_SYMFONY) php bin/console doctrine:migrations:migrate prev --no-interaction --env=prod

prod-logs: ## Monitor production logs
	$(COMPOSE_PROD_CMD) logs -f --tail=100

prod-shell: ## Open shell in production symfony
	$(COMPOSE_PROD_CMD) exec symfony sh

prod-status: ## List production containers health
	$(COMPOSE_PROD_CMD) ps

# --- MANUTENÇÃO ---
cache-clear-prod: ## Clear production cache
	$(PROD_SYMFONY) php bin/console cache:clear --env=prod

backup-db: ## Generate database backup with rotation
	bash $(DEVOPS_DIR)/backup.sh

ssl-renew: ## Renew SSL certificates
	$(COMPOSE_PROD_CMD) run --rm certbot renew
	$(COMPOSE_PROD_CMD) exec nginx nginx -s reload

setup-prod-env: ## Cria .env na raiz a partir de devops/.env.prod.example
	@test -f $(ENV_PROD_FILE) || (cp devops/.env.prod.example $(ENV_PROD_FILE) && echo "⚠️  Configure o $(ENV_PROD_FILE) antes de continuar!")
