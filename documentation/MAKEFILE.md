# Makefile — Guia de Produtividade

Este documento resume as principais receitas do `Makefile` para gerenciar a stack Catalyst Skeleton localmente. Todos os comandos são executados através do `docker compose` para garantir isolamento e consistência entre máquinas.

## Gerenciamento da Stack
- `make build`: reconstrói as imagens dos serviços Docker.
- `make up`: sobe todos os containers exibindo logs em tempo real (foreground).
- `make up-d`: sobe todos os containers em background (modo detached).
- `make down`: para todos os serviços e remove os containers.
- `make restart`: reinicia a stack completa no modo detached.

## Fluxo de Desenvolvimento
- `make install`: orquestra `install-backend` (Composer) e `install-frontend` (NPM/Vite).
- `make logs-backend`: segue apenas os logs do container Symfony/Apache.
- `make logs-frontend`: segue apenas os logs do container Vite.
- `make bash-backend`: abre um terminal interativo dentro do container Symfony.
- `make bash-frontend`: abre um terminal interativo (sh) no container Vite.

## Qualidade e Lint (Garantia de Código)
- **Backend (PHP)**:
  - `make lint-php`: analisa o estilo de código (PSR-12) via PHP-CS-Fixer em modo dry-run.
  - `make fix-php`: aplica automaticamente as correções de estilo de código.
- **Frontend (TSX)**:
  - `make lint-tsx`: analisa o código TS/React utilizando Biome 1.9.
  - `make fix-tsx`: aplica correções automáticas e formatação via Biome Write.
- **Geral**:
  - `make lint-all`: roda a bateria completa de análise estática (Lint PHP + Biome).

## Testes Automatizados (PHPUnit)
- `make test`: executa a suite completa de testes.
- `make test-unit`: executa apenas os testes unitários (`tests/Unit`).
- `make test-integration`: executa os testes de integração com banco de dados (`tests/Integration`).
- `make test-coverage`: gera o relatório de cobertura de código (precisa de Xdebug ativo).

## Banco de Dados (Doctrine)
- `make migrate`: executa migrations pendentes no ambiente local.
- `make rollback`: reverte a última migração executada (útil em desenvolvimento).
- `make new-migration`: gera uma nova classe de migração comparando o schema das Entidades com o Banco.

## Produção (DevOps)
- `make deploy`: realiza o build de produção das imagens e sobe a stack no `docker-compose.prod.yaml`.
- `make prod-logs`: monitora logs reais do ambiente de produção.
- `make prod-status`: lista a saúde dos containers produtivos e seus status.
- `make cache-clear-prod`: limpa o cache do Symfony dentro do container prod.
