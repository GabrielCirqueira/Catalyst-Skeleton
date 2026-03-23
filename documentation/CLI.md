# Scripts de Produtividade (cli/)

O diretório `cli/` contém ferramentas fundamentais para automação e garantia de qualidade (QA) do projeto Subflow. Todos os scripts são executáveis e operam primariamente via Docker para isolamento.

## Automação de Features
- **`cli/new-feature.sh`**: Script interativo de scaffolding. Gera automaticamente a estrutura completa (Entidade, DTO, Service, Controller, Serializer e Repository no backend; Pages, Hook e API no frontend).
- **`cli/generate-jwt.sh`**: Wrapper que dispara o comando do Symfony para girar e assinar as chaves RS256 necessárias para o subsistema de autenticação.

## Garantia de Qualidade (QA) de Backend
- **`cli/phpstan.sh`**: Executa o PHPStan no nível 6 para análise estática rigorosa de código PHP. Identifica loops de recursão, tipos ausentes e bugs lógicos.
- **`cli/phpcs.sh`**: Analisa o código fonte em busca de violações do guia de estilo (PSR-12 customizado).
- **`cli/phpcbf.sh`**: Utiliza o PHPCBF para corrigir automaticamente 90%+ das violações de lint no PHP.
- **`cli/phpcbf-diff.sh`**: Mostra um diff colorido das alterações sugeridas pelo linter antes de aplicá-las.

## Garantia de Qualidade (QA) de Frontend
- **`cli/frontend-lint.sh`**: Wrapper para o Biome 1.9 que realiza a análise de lint no diretório `web/`.
- **`cli/frontend-fix.sh`**: Aplica correções automáticas (Biome Check Write) e formatação de código no frontend.

## Gestão de Ambiente e Hooks
- **`cli/install-hooks.sh`**: Instala e configura os Git Hooks locais via Husky/lint-staged. Garante que nenhum código quebre o build principal ou viole o guia de estilo no momento do commit.
- **`cli/pre-commit.sh`**: Roteiro executado pelo Husky antes de cada commit (PHPStan + Biome).
- **`cli/remove-comments.sh`**: Script utilitário para limpeza de código legado ou comentários redundantes em massa.

## Uso Recomendado
Sempre prefira rodar os comandos via **Makefile** (`make lint-all`, `make fix-php`, etc.), pois os alvos do Makefile encapsulam a complexidade técnica (UID/GID, volumes do Docker) para chamar os scripts do diretório `cli/` de forma transparente.
