# Backend (src/)

Este documento descreve a API/backend Symfony. O Catalyst Skeleton segue uma arquitetura orientada a serviços e lógica de negócio desacoplada.

## Tecnologias e Stack
- **PHP 8.4** (no container) + **Symfony 7.3** (framework principal)
- **Doctrine ORM 3** (mapeamento objeto-relacional)
- **Migrations 3** (versionamento do schema do banco de dados)
- **Messenger** (processamento de tarefas assíncronas via workers)
- **RS256 JWT** (autenticação segura e stateless)
- **Gesdinet** (gerenciamento de refresh tokens persistentes)
- **PHPStan 2** (análise estática rigorosa no nível 6)
- **PHP-CS-Fixer 3** (estilo de código PSR-12 e modernizações de sintaxe)

## Estrutura de Diretórios e Responsabilidade
- `src/Entity/`: Domínio rico. Entidades com UUID v7. Regras de invariantes devem ficar aqui.
- `src/Service/`: Lógica de orquestração atômica. Um service = uma ação de negócio (`executar()`).
- `src/Repository/`: Acesso direto ao banco. Queries complexas e acesso ao EntityManager.
- `src/DataObject/`: DTOs de entrada tipados e validados por atributos do Symfony.
- `src/Serializer/`: Definição dos contratos JSON de saída. Protege o frontend contra mudanças no banco.
- `src/Controller/`: Apenas roteamento e orquestração leve. Recebem DTOs e retornam JSON via Serializer.
- `src/Resultado.php`: Padronização de retornos para evitar o uso de exceções como fluxo de negócio.

## Regras de Ouro (Cultura de Engenharia)
1. **Padrão Resultado**: Nunca retorne arrays ou lance exceções para erros previstos (ex: 'usuário não encontrado'). Use `Resultado::sucesso($dados)` ou `Resultado::falha('codigo_erro')`.
2. **Early Return por Complexidade**: Ordene suas **Guard Clauses** sempre pelo custo de processamento. Verificações de variáveis locais ou flags devem vir **antes** de qualquer consulta ao banco ou chamada de API externa.
3. **Imutabilidade e Readonly**: Use classes `readonly` e propriedades tipadas sempre que possível. O backend deve ser altamente previsível e livre de efeitos colaterais ocultos.
4. **UUID v7**: Todas as novas entidades devem usar UUID v7 como PK, garantindo ordenação cronológica nativa no banco de dados.

## Rotas e API
- Configuração via atributos (Annotations) nos Controllers.
- Prefixos globais por módulo (ex: `#[Route('/api/auth')]`).
- Padronização de respostas de erro via `KernelExceptionListener`.

## Banco de Dados e Migrations
- Gerenciamento local: `make migrate` (sobe alterações) e `make rollback` (reverte a última).
- Geração de diff: `make new-migration`.
- Docker: Imagem `mysql:8.3` com configuração externa via `ports.env`.

## Qualidade e Qualificação (QA)
- **Análise Estática**: `./cli/phpstan.sh` ou `make bash-backend` seguido de `vendor/bin/phpstan`.
- **Linter de Estilo**: `make lint-php` (dry-run) ou `make fix-php` (correção automática).
- **Testes Unitários**: `make test-unit` (testes sem I/O para lógica pura).
- **Testes de Integração**: `make test-integration` (testes com banco de dados dedicado).
- **QA Completo**: `make test` executa toda a bateria de verificação.
