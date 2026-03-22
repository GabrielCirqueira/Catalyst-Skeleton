#!/usr/bin/env bash

set -e

ROOT_DIR=$(dirname "$0")/..
YELLOW="\033[0;33m"
RED="\033[0;31m"
GREEN="\033[0;32m"
NC="\033[0m"

echo "🔍 Verificando convenções de nomenclatura..."
ERRORS=0

echo -n "   - Getters em DTOs: "
VIOLACOES_GET=$(grep -rlE 'public function get[A-Z]' "$ROOT_DIR/src/DataObject" 2>/dev/null || true)
if [ -n "$VIOLACOES_GET" ]; then
    echo -e "${RED}[FALHOU]${NC}"
    echo "$VIOLACOES_GET" | sed 's/^/     -> /'
    echo "       (Dica: remova o prefixo 'get' de todas essas classes conforme o guia)"
    ERRORS=1
else
    echo -e "${GREEN}[OK]${NC}"
fi

echo -n "   - Diretórios de Controllers (Subpastas): "
VIOLACOES_CONTROLLER=$(find "$ROOT_DIR/src/Controller" -mindepth 1 -maxdepth 1 -type f -name "*Controller.php" ! -name "HealthController.php" 2>/dev/null || true)
if [ -n "$VIOLACOES_CONTROLLER" ]; then
    echo -e "${RED}[FALHOU]${NC}"
    echo "$VIOLACOES_CONTROLLER" | sed 's/^/     -> /'
    echo "       (Dica: mova-os para subpastas /Categoria/)"
    ERRORS=1
else
    echo -e "${GREEN}[OK]${NC}"
fi

if [ -d "$ROOT_DIR/src/DataObject" ]; then
    echo -n "   - Nomenclatura de DTOs: "
    VIOLACOES_DTO=$(find "$ROOT_DIR/src/DataObject" -type f -name "*.php" ! -name "*DTO.php" ! -name "AbstractDTO.php" 2>/dev/null || true)
    if [ -n "$VIOLACOES_DTO" ]; then
        echo -e "${RED}[FALHOU]${NC}"
        echo "$VIOLACOES_DTO" | sed 's/^/     -> /'
        echo "       (Dica: renomencie os arquivos adicionando o sufixo 'DTO.php')"
        ERRORS=1
    else
        echo -e "${GREEN}[OK]${NC}"
    fi
fi

if [ -d "$ROOT_DIR/src/Service" ]; then
    echo -n "   - Nomenclatura de Services (Verbo+Entidade+Service): "
    VERBOS="Criar|Listar|Buscar|Deletar|Atualizar|Remover|Salvar|Exportar|Importar|Processar|Validar|Gerar|Autenticar|Login|Logout|Cancelar|Ativar|Desativar|Enviar|Receber|Executar"
    VIOLACOES_SERVICE=$(find "$ROOT_DIR/src/Service" -type f -name "*.php" | grep -vE "/($VERBOS)[A-Z][a-zA-Z]*Service\.php$" 2>/dev/null || true)
    
    if [ -n "$VIOLACOES_SERVICE" ]; then
        echo -e "${YELLOW}[AVISO]${NC}"
        echo "$VIOLACOES_SERVICE" | sed 's/^/     -> /'
        echo "       (Dica: Use o padrão Verbo + Entidade + Service. Ex: CriarUsuarioService.php)"
    else
        echo -e "${GREEN}[OK]${NC}"
    fi
fi

if [ $ERRORS -ne 0 ]; then
    echo -e "\n${RED}Foram detectadas violações nas convenções oficiais. Corrija-as e tente novamente!${NC}"
    exit 1
else
    echo -e "\n${GREEN}Nenhuma violação encontrada! Todo código está no padrão.${NC}"
fi