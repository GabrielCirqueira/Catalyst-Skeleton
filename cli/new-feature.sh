#!/usr/bin/env bash

set -e

# Configurações iniciais
ROOT_DIR=$(dirname "$0")/..
YELLOW="\033[0;33m"
GREEN="\033[0;32m"
NC="\033[0m" # No Color

echo -e "${YELLOW}Qual o nome da Feature (ex: Produto, Financeiro, Usuario)?${NC}"
read -p "> " FEATURE_NAME

if [[ -z "$FEATURE_NAME" ]]; then
    echo "O nome da feature não pode ser vazio."
    exit 1
fi

FEATURE_LOWER=$(echo "$FEATURE_NAME" | tr '[:upper:]' '[:lower:]')

echo -e "\n${GREEN}Criando scaffolding para a feature: $FEATURE_NAME${NC}\n"

# ======== BACKEND ========
mkdir -p "$ROOT_DIR/src/Entity"
if [ ! -f "$ROOT_DIR/src/Entity/$FEATURE_NAME.php" ]; then
    cat <<EOF > "$ROOT_DIR/src/Entity/$FEATURE_NAME.php"
<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity]
class $FEATURE_NAME
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    private ?Uuid \$uuid = null;

    public function uuid(): ?Uuid
    {
        return \$this->uuid;
    }
}
EOF
    echo "✅ src/Entity/$FEATURE_NAME.php"
fi

mkdir -p "$ROOT_DIR/src/Service/$FEATURE_NAME"
if [ ! -f "$ROOT_DIR/src/Service/$FEATURE_NAME/Criar${FEATURE_NAME}Service.php" ]; then
    cat <<EOF > "$ROOT_DIR/src/Service/$FEATURE_NAME/Criar${FEATURE_NAME}Service.php"
<?php

declare(strict_types=1);

namespace App\Service\\$FEATURE_NAME;

class Criar${FEATURE_NAME}Service
{
    public function executar()
    {
        // TODO: Implementar lógica de aplicação pura
    }
}
EOF
    echo "✅ src/Service/$FEATURE_NAME/Criar${FEATURE_NAME}Service.php"
fi

mkdir -p "$ROOT_DIR/src/Controller/$FEATURE_NAME"
if [ ! -f "$ROOT_DIR/src/Controller/$FEATURE_NAME/${FEATURE_NAME}Controller.php" ]; then
    cat <<EOF > "$ROOT_DIR/src/Controller/$FEATURE_NAME/${FEATURE_NAME}Controller.php"
<?php

declare(strict_types=1);

namespace App\Controller\\$FEATURE_NAME;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/$FEATURE_LOWER')]
class ${FEATURE_NAME}Controller extends AbstractController
{
    #[Route('', name: 'api_${FEATURE_LOWER}_criar', methods: ['POST'])]
    public function criar(): JsonResponse
    {
        return \$this->json(['sucesso' => true]);
    }
}
EOF
    echo "✅ src/Controller/$FEATURE_NAME/${FEATURE_NAME}Controller.php"
fi

mkdir -p "$ROOT_DIR/src/DataObject/$FEATURE_NAME"
if [ ! -f "$ROOT_DIR/src/DataObject/$FEATURE_NAME/Criar${FEATURE_NAME}DTO.php" ]; then
    cat <<EOF > "$ROOT_DIR/src/DataObject/$FEATURE_NAME/Criar${FEATURE_NAME}DTO.php"
<?php

declare(strict_types=1);

namespace App\DataObject\\$FEATURE_NAME;

use Symfony\Component\Validator\Constraints as Assert;

class Criar${FEATURE_NAME}DTO
{
    public function __construct(
        // #[Assert\NotBlank]
        // public readonly string \$nome,
    ) {}
}
EOF
    echo "✅ src/DataObject/$FEATURE_NAME/Criar${FEATURE_NAME}DTO.php"
fi

mkdir -p "$ROOT_DIR/src/Repository"
if [ ! -f "$ROOT_DIR/src/Repository/${FEATURE_NAME}Repository.php" ]; then
    cat <<EOF > "$ROOT_DIR/src/Repository/${FEATURE_NAME}Repository.php"
<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\\$FEATURE_NAME;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository\\$FEATURE_NAME>
 */
class ${FEATURE_NAME}Repository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry \$registry)
    {
        parent::__construct(\$registry, ${FEATURE_NAME}::class);
    }

    public function salvar(${FEATURE_NAME} \$entidade, bool \$flush = true): void
    {
        \$this->getEntityManager()->persist(\$entidade);
        if (\$flush) {
            \$this->getEntityManager()->flush();
        }
    }

    public function remover(${FEATURE_NAME} \$entidade, bool \$flush = true): void
    {
        \$this->getEntityManager()->remove(\$entidade);
        if (\$flush) {
            \$this->getEntityManager()->flush();
        }
    }
}
EOF
    echo "✅ src/Repository/${FEATURE_NAME}Repository.php"
fi

FRONTEND_DIR="$ROOT_DIR/web/features/$FEATURE_LOWER"
mkdir -p "$FRONTEND_DIR"
mkdir -p "$FRONTEND_DIR/components"
mkdir -p "$FRONTEND_DIR/hooks"
mkdir -p "$FRONTEND_DIR/pages"

if [ ! -f "$FRONTEND_DIR/types.ts" ]; then
    cat <<EOF > "$FRONTEND_DIR/types.ts"
export interface ${FEATURE_NAME} {
  uuid: string;
}
EOF
    echo "✅ web/features/$FEATURE_LOWER/types.ts"
fi

if [ ! -f "$FRONTEND_DIR/api.ts" ]; then
    cat <<EOF > "$FRONTEND_DIR/api.ts"
import { api } from '@config/api';
import type { ${FEATURE_NAME} } from './types';

export const ${FEATURE_LOWER}Api = {
  criar: async (payload: Partial<${FEATURE_NAME}>) => {
    const { data } = await api.post('/api/v1/$FEATURE_LOWER', payload);
    return data;
  },
};
EOF
    echo "✅ web/features/$FEATURE_LOWER/api.ts"
fi

echo -e "\n${GREEN}Scaffolding finalizado! Você acabou de economizar 10 minutos.${NC}"
