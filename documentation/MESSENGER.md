# Processamento Assíncrono (Messenger)

O Subflow utiliza o **Symfony Messenger** para desacoplar tarefas pesadas da resposta HTTP imediata, garantindo uma interface rápida e resiliente.

## Infraestrutura

- **Transporte**: O transporte padrão é o `doctrine` (tabela `messenger_messages` no MySQL). Isso elimina a necessidade de um Redis ou RabbitMQ em projetos pequenos/médios, mantendo a simplicidade.
- **Worker**: O container `symfony` roda um processo de worker gerenciado pelo `supervisord`.
- **Supervisor**: O arquivo `supervisord.conf` na raiz configura o número de processos (`messenger-consume`) e reinício automático em caso de falha.

---

## Criando uma Mensagem Assíncrona

### 1. Mensagem (`src/Message/`)

O objeto que carrega apenas os dados necessários (payload).

```php
readonly class EnviarBoasVindasMessage
{
    public function __construct(
        public string $usuarioId,
    ) {
    }
}
```

### 2. Handler (`src/MessageHandler/`)

A classe que executa a ação propriamente dita.

```php
#[AsMessageHandler]
final class EnviarBoasVindasHandler
{
    public function __invoke(EnviarBoasVindasMessage $message): void
    {
        // Lógica de envio de e-mail aqui...
    }
}
```

### 3. Despachando a Mensagem

Injete o `MessageBusInterface` no seu Service ou Controller:

```php
$this->bus->dispatch(new EnviarBoasVindasMessage($usuario->getId()));
```

---

## Agendamento de Tarefas (Symfony Scheduler)

Além de mensagens sob demanda, o Catalyst Skeleton utiliza o **Symfony Scheduler** para tarefas recorrentes (o sucessor moderno do Cron externo).

### O Scheduler Principal (`src/Schedule/MainScheduler.php`)

As tarefas são centralizadas neste componente. Por padrão, o Skeleton já vem com um batimento cardíaco (Heartbeat) configurado para garantir que a automação esteja ativa.

```php
#[AsSchedule('default')]
final class MainScheduler implements ScheduleProviderInterface
{
    public function getSchedule(): Schedule
    {
        return (new Schedule())
            ->add(
                RecurringMessage::every('1 hour', new HeartbeatMessage())
            );
    }
}
```

### Execução em Produção

O worker rodando no container `symfony` atende tanto ao Messenger quanto ao Scheduler simultaneamente através do comando:
`php bin/console messenger:consume async scheduler_default`

### Comandos Úteis

- **Monitorar Agendamentos**: `php bin/console debug:scheduler`
- **Reiniciar Workers**: `php bin/console messenger:stop-workers` (útil após deploy)

---

## Monitoramento e Logs

- **Logs em tempo real**: `make logs-scheduler` (exibe o output do worker e cron).
- **Consumo de Memória**: O Supervisor reinicia o worker se ele exceder o limite de tempo ou memória configurado no `supervisord.conf`.

---

## Quando usar cada um?

- **Messenger**: Para ações disparadas por eventos do usuário (ex: "Enviar e-mail após cadastro").
- **Scheduler**: Para rotinas fixas (ex: "Gerar relatório toda madrugada", "Limpar logs antigos a cada 7 dias").
