# Módulo: Observability (Sentry)

Ative este módulo quando o projeto precisar de rastreamento de erros em produção.

## O que este módulo adiciona

| Componente | Descrição |
|---|---|
| `sentry/sentry-symfony` | SDK Sentry para PHP |
| `@sentry/react` | SDK Sentry para React (já incluso no core) |
| `config/packages/sentry.yaml` | Configuração do Sentry |

## Como ativar

No `setup.sh`, selecione a opção `[observability]` quando perguntado sobre módulos.

Ou manualmente:

```bash
composer require sentry/sentry-symfony
```

Configure a variável de ambiente:

```dotenv
# .env.local
SENTRY_DSN=https://sua-chave@sentry.io/seu-projeto
```

## Arquivos do módulo

- `sentry.yaml` ? `config/packages/sentry.yaml`
- Adicione `Sentry\SentryBundle\SentryBundle::class => ['prod' => true]` ao `config/bundles.php`

## Variáveis de ambiente necessárias

| Variável | Exemplo | Descrição |
|---|---|---|
| `SENTRY_DSN` | `https://abc@sentry.io/123` | DSN do projeto Sentry. Vazio = desativado. |
