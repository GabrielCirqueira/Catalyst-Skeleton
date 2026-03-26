#!/bin/bash

# Script CLI para gerar um Token JWT Master (Full Access)
# Uso: cli/jwt-full-access.sh

# Cores para o terminal
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Verificando Ambiente para Geração de Token Master...${NC}"

# 1. Verifica se o .env existe
if [ ! -f ".env" ]; then
    echo -e "${RED}Erro: Arquivo .env não encontrado. Execute setup.sh primeiro.${NC}"
    exit 1
fi

# 2. Verifica se o Docker está rodando e o container symfony está ativo
if ! docker compose --env-file docker/ports.env -f docker/docker-compose.yaml ps symfony --status running | grep -q "symfony"; then
    echo -e "${RED}Erro: O container 'symfony' não está rodando. Inicie o projeto com docker compose up.${NC}"
    exit 1
fi

# 3. Executa o comando Symfony console dentro do container
docker compose --env-file docker/ports.env -f docker/docker-compose.yaml exec symfony php bin/console app:jwt:master
