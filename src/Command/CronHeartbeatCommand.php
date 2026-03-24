<?php

declare(strict_types=1);

namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(
    name: 'app:cron:heartbeat',
    description: 'Registra uma mensagem simples para confirmar que o cron está ativo.'
)]
final class CronHeartbeatCommand extends Command
{
    private const LOG_FILE = '/var/log/cron/command.log';

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $nowUtc = new \DateTimeImmutable('now', new \DateTimeZone('UTC'));
        $message = sprintf('[cron] Comando executado às %s UTC', $nowUtc->format('Y-m-d H:i:s'));

        file_put_contents(self::LOG_FILE, $message.PHP_EOL, FILE_APPEND);
        $output->writeln($message);

        return Command::SUCCESS;
    }
}
