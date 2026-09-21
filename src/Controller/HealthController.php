<?php

declare(strict_types=1);

namespace App\Controller;

use Doctrine\DBAL\Connection;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class HealthController extends DefaultController
{
    public function __construct(
        private readonly Connection $connection,
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
            'version' => $_ENV['APP_VERSION'] ?? '1.0.0-dev',
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
        $freeSpace = disk_free_space('/') ?: 0;
        $threshold = 100 * 1024 * 1024;

        return [
            'status' => $freeSpace > $threshold ? 'ok' : 'critical',
            'free_mb' => round($freeSpace / 1024 / 1024, 2),
            'threshold_mb' => 100,
        ];
    }
}
