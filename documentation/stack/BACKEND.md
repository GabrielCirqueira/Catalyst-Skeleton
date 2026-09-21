# Backend (src/)

Este documento descreve a API/backend Symfony. O Catalyst Skeleton v5 segue uma arquitetura orientada a serviços e lógica de negócio desacoplada, com um **núcleo enxuto** e módulos opcionais ativados conforme a necessidade do projeto.

## Tecnologias e Stack

| Tecnologia | Papel |
| :--- | :--- |
| **PHP 8.4** | Runtime; Readonly Classes, Enums, Typed Properties, Attributes |
| **Symfony 7.3** | Framework principal (HTTP, DI container, Console) |
| **Doctrine ORM 3** | Mapeamento objeto-relacional, Unit of Work, migrations |
| **Lexik JWT** | Emissão e validação de access tokens (RS256, TTL 1h) |
| **Gesdinet Refresh Token** | Refresh tokens persistidos no banco (TTL 30 dias) |
| **Nelmio CORS** | Configuração CORS para `/api/*` |
| **Symfony Rate Limiter** | Proteção contra brute-force no login (5/min) |
| **Monolog** | Logs estruturados (texto em dev, JSON em prod) |
| **PHPStan 2** | Análise estática — nível 6 |

> **Módulos opcionais** ? ativados via `setup.sh` ou instalação manual:
> - `?? async` ? `symfony/doctrine-messenger` + `symfony/scheduler` (filas e tarefas agendadas)
> - `?? observability` ? `sentry/sentry-symfony` (rastreamento de erros em produção)

## Estrutura de Diretórios

```
src/
??? Command/        CLI: AppSeedCommand, CronHeartbeatCommand, JwtMasterCommand
??? Controller/     API REST ? roteamento e orquestração leve
??? DataObject/     DTOs de entrada tipados (validados por atributos Symfony)
??? Entity/         Entidades Doctrine (Usuario, RefreshToken)
??? Enum/           Enums PHP 8.1+
??? EventListener/  Listeners + Event/ (fatos de domínio)
??? Feature/        *Feature.php + TaggedIterator (lógica grande em vários services)
??? Interface/      Contratos PHP (*Interface.php)
??? Repository/     Acesso ao banco de dados (queries DQL/QueryBuilder)
??? Serializer/     Contratos JSON de saída (protegem frontend de mudanças internas)
??? Service/        Lógica de negócio ? um service = uma ação (executar())
??? Kernel.php
??? Resultado.php   Padrão Resultado (sucesso/falha sem exceções)
```

> Se o módulo `async` estiver ativo, o setup adiciona:
> `src/Message/`, `src/MessageHandler/`, `src/Schedule/`

## Padrão Resultado

Toda operação de negócio retorna `Resultado` em vez de lançar exceções para casos previstos:

```php
public function executar(CriarUsuarioDTO $dto): Resultado
{
    if ($this->repositorio->usernameJaExiste($dto->username)) {
        return Resultado::falha('username_duplicado');
    }
    $usuario = new Usuario($dto->nomeCompleto, $dto->username);
    $this->repositorio->salvar($usuario);
    return Resultado::sucesso($usuario);
}

// No Controller:
$resultado = $this->criarUsuarioService->executar($dto);
if (!$resultado->ehSucesso()) {
    return $this->json(['sucesso' => false, 'erro' => $resultado->obterErro()], 409);
}
```

## Rotas e API

- Prefixo obrigatório: `/api/v1/`
- Recursos no plural: `/api/v1/usuarios`, `/api/v1/pedidos`
- Configuração via atributo `#[Route]` nos Controllers
- Respostas de erro padronizadas pelo `KernelExceptionListener`

**Endpoints do core:**

| Método | Rota | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Público | Status da aplicação (DB, disco) |
| `POST` | `/api/v1/auth/login` | Público | Login ? `{ token, refresh_token }` |
| `POST` | `/api/v1/auth/registro` | Público | Cadastro de novo usuário |
| `GET` | `/api/v1/auth/me` | JWT | Dados do usuário autenticado |
| `POST` | `/api/v1/token/refresh` | Público | Renova o access token |

## Regras de Ouro

1. **Padrão Resultado**: Nunca lance exceções para erros previstos. Use `Resultado::sucesso()` ou `Resultado::falha('codigo')`.
2. **Early Return**: Ordene Guard Clauses pelo custo ? verificação local ? banco ? API externa.
3. **Serializer obrigatório**: Todo endpoint que retorna dados de entidade usa `src/Serializer/`. Nunca retorne a entidade diretamente.
4. **Readonly**: Use `readonly` em classes DTO e propriedades imutáveis.

## Banco de Dados e Migrations

```bash
make migrate          # Aplica migrations pendentes
make new-migration    # Gera migration por diff do schema
make rollback         # Reverte a última migration (só em dev)
```

## Qualidade (QA)

```bash
make phpstan          # Análise estática nível 6
make phpcs            # Estilo PSR-12
make fix-php          # Auto-correção de estilo
```
