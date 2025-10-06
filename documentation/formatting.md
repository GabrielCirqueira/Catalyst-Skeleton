# Formatação e Lint

Este documento cobre ESLint/Prettier para o frontend e PHPCS/PHPCBF + PHPStan para o backend.

## Frontend (ESLint + Prettier)
- Configuração Flat em `eslint.config.js`.
- Plugins: React, React Hooks, TypeScript, Prettier, config-prettier.
- Regra principal: `'prettier/prettier': ['error', { semi: false }]` (sem ponto e vírgula).
- Lint: `./cli/frontend-lint.sh`.
- Auto-fix: `./cli/frontend-fix.sh`.
- VS Code: `.vscode/settings.json` habilita auto-fix on save (`source.fixAll.eslint`).

## Backend PHP
- PHPStan: `phpstan.neon` (level 6, paths `src` e `tests`).
- PHPCS: `phpcs.xml` (base PSR-12; php_version=80400).
- PHPCBF: auto-fix das regras do PHPCS.

Comandos prontos em `composer.json` e `cli/`:
- `composer lint:php:stan`
- `composer lint:php:cs`
- `composer fix:php`
- `composer fix:php:diff`

## Pre-commit
- `cli/pre-commit.sh` executa: PHPStan → PHPCS → ESLint.
- Hook é instalado automaticamente via Composer (pós-install/update) ou manualmente com `cli/install-hooks.sh`.

