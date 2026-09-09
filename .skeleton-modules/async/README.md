# Módulo: Async (Messenger + Scheduler)

Ative este módulo quando o projeto precisar de processamento assíncrono (filas, tarefas agendadas, workers).

## O que este módulo adiciona

| Componente | Descrição |
|---|---|
| `symfony/doctrine-messenger` | Fila de mensagens com transporte Doctrine |
| `symfony/scheduler` | Tarefas agendadas nativas |
| `symfony/notifier` | Notificações via e-mail, SMS e chat |
| `config/packages/messenger.yaml` | Configuração de transports e routing |
| `src/Schedule/MainScheduler.php` | Provider de tarefas agendadas |
| `supervisord.conf` | Workers Messenger gerenciados pelo Supervisor |

## Como ativar

No `setup.sh`, selecione a opção `[async]` quando perguntado sobre módulos.

Ou manualmente:

```bash
composer require symfony/doctrine-messenger symfony/scheduler symfony/notifier
```

Copie os arquivos deste diretório para os destinos indicados.

## Arquivos do módulo

- `messenger.yaml` ? `config/packages/messenger.yaml`
- `MainScheduler.php` ? `src/Schedule/MainScheduler.php`
- `supervisord.conf` ? `supervisord.conf` (raiz do projeto)
