SHELL := /bin/bash

COMPOSE ?= docker compose
COMPOSE_FILE ?= docker-compose.yaml
COMPOSE_ENV_FILE ?= ports.env
COMPOSE_CMD = $(COMPOSE) --env-file $(COMPOSE_ENV_FILE) -f $(COMPOSE_FILE)
EXEC_BACKEND = $(COMPOSE_CMD) exec backend
EXEC_FRONTEND = $(COMPOSE_CMD) exec frontend
EXEC_SCHEDULER = $(COMPOSE_CMD) exec scheduler

.PHONY: help build up up-d down restart install install-backend install-frontend composer npm lint-php lint-tsx lint-all logs-backend logs-frontend logs-scheduler bash-backend bash-frontend supervisor-shell

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

install-backend: ## Install composer dependencies using the backend image
	$(COMPOSE_CMD) run --rm backend composer install --no-interaction --prefer-dist

install-frontend: ## Install npm dependencies using the frontend image
	$(COMPOSE_CMD) run --rm frontend sh -lc "npm install"

composer: ## Run an arbitrary composer command (ARGS="update")
	$(COMPOSE_CMD) run --rm backend composer $(ARGS)

npm: ## Run an arbitrary npm command (ARGS="run build")
	$(COMPOSE_CMD) run --rm frontend npm $(ARGS)

lint-php: ## Fix PHP code style using PHP-CS-Fixer inside the backend container
	$(EXEC_BACKEND) php vendor/bin/php-cs-fixer fix

lint-tsx: ## Fix React/TypeScript lint issues inside the frontend container
	$(EXEC_FRONTEND) npx eslint . --ext .tsx,.ts,.jsx,.js --fix

lint-all: lint-php lint-tsx ## Run all linters

logs-backend: ## Tail backend logs
	$(COMPOSE_CMD) logs -f backend

logs-frontend: ## Tail frontend logs
	$(COMPOSE_CMD) logs -f frontend

logs-scheduler: ## Tail supervisor/cron logs
	$(COMPOSE_CMD) logs -f scheduler

bash-backend: ## Open a Bash shell in the backend container
	$(EXEC_BACKEND) bash

bash-frontend: ## Open a Bash shell in the frontend container
	$(EXEC_FRONTEND) sh

supervisor-shell: ## Open a Bash shell in the scheduler container
	$(EXEC_SCHEDULER) bash
