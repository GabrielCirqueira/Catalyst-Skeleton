COMPOSER = composer
NPM = npm
SYMFONY = symfony

symfony:
	$(SYMFONY) server:start --port=8000 &

npm:
	$(NPM) run dev

setup:
	$(COMPOSER) install
	$(NPM) install --legacy-peer-deps
	$(SYMFONY) server:start --port=8000 &
	$(NPM) run dev

up:
	$(NPM) run dev &
	$(SYMFONY) server:start --port=8000

down:
	$(SYMFONY) server:stop
	pkill -f "npm run dev"
	$(DOCKER_COMPOSE) down

lint-php:
	php vendor/bin/php-cs-fixer fix

lint-tsx:
	npx eslint . --ext .tsx,.ts,.jsx,.js --fix

lint-all: lint-php lint-tsx 