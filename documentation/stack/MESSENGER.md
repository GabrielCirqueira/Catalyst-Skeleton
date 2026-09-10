# Processamento Assíncrono (Módulo `async`)

> ?? **Este recurso é um módulo opt-in.** Ele **não está instalado por padrão**.
> Para ativá-lo, execute `bash scripts/setup.sh` e selecione o módulo `async` quando solicitado,
> ou instale manualmente seguindo as instruções abaixo.

---

## O que o módulo inclui

- **Symfony Messenger** ? filas assíncronas com transporte Doctrine (tabela `messenger_messages`)
- **Symfony Scheduler** ? tarefas recorrentes (substituto moderno do Cron externo)
- **Supervisor** ? configuração de workers para produção
- Estrutura de código em `src/Message/`, `src/MessageHandler/`, `src/Schedule/`

---

## Instalação Manual

```bash
# 1. Instalar pacotes
composer require symfony/messenger symfony/scheduler

# 2. Copiar arquivos do módulo
cp -r .skeleton-modules/async/src/Message      src/
cp -r .skeleton-modules/async/src/MessageHandler src/
cp -r .skeleton-modules/async/src/Schedule     src/
cp .skeleton-modules/async/messenger.yaml      config/packages/messenger.yaml

# 3. Adicionar workers ao Supervisor (produção)
cat .skeleton-modules/async/supervisord-messenger.conf >> devops/php/supervisord-prod.conf
```

---

## Infraestrutura

- **Transporte**: `doctrine` por padrão (tabela `messenger_messages` no MySQL) ? sem necessidade de Redis ou RabbitMQ em projetos pequenos/médios
- **Worker**: gerenciado pelo `supervisord` no container PHP
- **Scheduler**: integrado ao mesmo worker, sem processo separado

---

## Criando uma Mensagem Assíncrona

### 1. Mensagem (`src/Message/`)

```php
readonly class EnviarBoasVindasMessage
{
    public function __construct(
        public string $usuarioId,
    ) {}
}
```

### 2. Handler (`src/MessageHandler/`)

```php
#[AsMessageHandler]
final class EnviarBoasVindasHandler
{
    public function __invoke(EnviarBoasVindasMessage $message): void
    {
        // lógica de envio de e-mail...
    }
}
```

### 3. Despachando

```php
// Em qualquer Service ou Controller:
$this->bus->dispatch(new EnviarBoasVindasMessage($usuario->getId()));
```

---

## Agendamento de Tarefas (Scheduler)

```php
// src/Schedule/MainScheduler.php
#[AsSchedule('default')]
final class MainScheduler implements ScheduleProviderInterface
{
    public function getSchedule(): Schedule
    {
        return (new Schedule())
            ->add(RecurringMessage::every('1 hour', new HeartbeatMessage()));
    }
}
```

O worker no container atende tanto o Messenger quanto o Scheduler:
```bash
php bin/console messenger:consume async scheduler_default
```

---

## Comandos Úteis

```bash
php bin/console debug:scheduler          # Inspeciona agendamentos ativos
php bin/console messenger:stop-workers   # Reinicia workers (pós-deploy)
make logs-scheduler                      # Logs do worker em tempo real
```

---

## Quando usar cada um?

| Ferramenta | Quando usar |
| :--- | :--- |
| **Messenger** | Ação disparada por evento do usuário (ex: "enviar e-mail após cadastro") |
| **Scheduler** | Rotina fixa em intervalo (ex: "gerar relatório toda madrugada") |
