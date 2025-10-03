SHELL := /bin/bash

COMPOSE ?= docker compose
COMPOSE_FILE ?= docker-compose.yaml
COMPOSE_ENV_FILE ?= ports.env
COMPOSE_CMD = $(COMPOSE) --env-file $(COMPOSE_ENV_FILE) -f $(COMPOSE_FILE)
EXEC_BACKEND = $(COMPOSE_CMD) exec symfony
EXEC_FRONTEND = $(COMPOSE_CMD) exec vite-react
EXEC_SCHEDULER = $(COMPOSE_CMD) exec symfony

.PHONY: help build up up-d down restart install install-backend install-frontend composer npm lint-php lint-tsx lint-all fix-php fix-php-diff logs-backend logs-frontend logs-scheduler bash-backend bash-frontend supervisor-shell

help: ## List available commands
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "%-24s %s\n", $$1, $$2}'

build: ## Build or rebuild service images
	$(COMPOSE_CMD) build

up: ## Start all services in attached mode
	$(COMPOSE_CMD) up

up-d: ## Start all services in detached mode
	$(COMPOSE_CMD) up -d --remove-orphans

restart: ## Restart the stack in detached mode
	$(COMPOSE_CMD) down --remove-orphans
	$(COMPOSE_CMD) up -d --remove-orphans

down: ## Stop and remove all services
	$(COMPOSE_CMD) down --remove-orphans

install: install-backend install-frontend ## Install PHP and Node dependencies

install-backend: ## Install composer dependencies using the symfony container
	$(COMPOSE_CMD) run --rm symfony composer install --no-interaction --prefer-dist

install-frontend: ## Install npm dependencies using the Vite container
	$(COMPOSE_CMD) run --rm vite-react sh -lc "npm install"

composer: ## Run an arbitrary composer command (ARGS="update")
	$(COMPOSE_CMD) run --rm symfony composer $(ARGS)

npm: ## Run an arbitrary npm command (ARGS="run build")
	$(COMPOSE_CMD) run --rm vite-react npm $(ARGS)

lint-php: ## Fix PHP code style using PHP-CS-Fixer inside the symfony container
	$(EXEC_BACKEND) php vendor/bin/php-cs-fixer fix

lint-tsx: ## Fix React/TypeScript lint issues inside the vite-react container
	$(EXEC_FRONTEND) npx eslint . --ext .tsx,.ts,.jsx,.js --fix

lint-all: lint-php lint-tsx ## Run all linters

fix-php: ## Auto-fix PHP CS issues in src and tests
	./cli/phpcbf.sh

fix-php-diff: ## Auto-fix PHP CS issues only for files changed vs HEAD (override with ARGS="--cached", etc.)
	./cli/phpcbf-diff.sh $(ARGS)

logs-backend: ## Tail backend logs (symfony container)
	$(COMPOSE_CMD) logs -f symfony

logs-frontend: ## Tail frontend logs (vite-react container)
	$(COMPOSE_CMD) logs -f vite-react

logs-scheduler: ## Tail supervisor/cron logs from symfony container
	$(COMPOSE_CMD) logs -f symfony

bash-backend: ## Open a Bash shell in the symfony container
	$(EXEC_BACKEND) bash

bash-frontend: ## Open a shell in the vite-react container
	$(EXEC_FRONTEND) sh

supervisor-shell: ## Open a Bash shell in the symfony container
	$(EXEC_SCHEDULER) bash
