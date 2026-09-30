<?php

declare(strict_types=1);

namespace App\Controller\Sistema;

use App\Controller\Common\DefaultController;
use Doctrine\DBAL\Connection;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class HealthController extends DefaultController
{
    private const int LIMITE_DISCO_LIVRE_MB = 100;
    private const string VERSAO_PADRAO = '1.0.0-dev';

    public function __construct(
        private readonly Connection $connection,
        #[Autowire('%app_version_padrao%')]
        private readonly string $appVersion = self::VERSAO_PADRAO,
    ) {
    }

    #[Route('/api/v1/health', name: 'api_health', methods: ['GET'])]
    public function health(): Response
    {
        $databaseStatus = $this->checkDatabase();
        $diskStatus = $this->checkDisk();
        $isHealthy = 'ok' === $databaseStatus['status'] && 'ok' === $diskStatus['status'];

        return $this->success([
            'status' => $isHealthy ? 'ok' : 'unhealthy',
            'timestamp' => (new \DateTime())->format(\DateTimeInterface::ATOM),
            'services' => [
                'database' => $databaseStatus,
                'disk' => $diskStatus,
            ],
            'version' => $this->appVersion,
        ], $isHealthy ? Response::HTTP_OK : Response::HTTP_SERVICE_UNAVAILABLE);
    }

    /**
     * @return array{status: string, message?: string}
     */
    private function checkDatabase(): array
    {
        try {
            $this->connection->executeQuery('SELECT 1');

            return ['status' => 'ok'];
        } catch (\Exception) {
            return [
                'status' => 'error',
                'message' => 'Banco de dados inacessível.',
            ];
        }
    }

    /**
     * @return array{status: string, free_mb: float, threshold_mb: int}
     */
    private function checkDisk(): array
    {
        $limiteBytes = self::LIMITE_DISCO_LIVRE_MB * 1024 * 1024;
        $freeSpace = disk_free_space('/') ?: 0;

        return [
            'status' => $freeSpace > $limiteBytes ? 'ok' : 'critical',
            'free_mb' => round($freeSpace / 1024 / 1024, 2),
            'threshold_mb' => self::LIMITE_DISCO_LIVRE_MB,
        ];
    }
}
