<?php

namespace App\Controller;

use Doctrine\DBAL\Connection;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class HealthController extends AbstractController
{
    public function __construct(
        private readonly Connection $connection,
    ) {
    }

    #[Route('/api/v1/health', name: 'api_health', methods: ['GET'])]
    public function health(): JsonResponse
    {
        $databaseStatus = $this->checkDatabase();
        $diskStatus = $this->checkDisk();
        $isHealthy = 'ok' === $databaseStatus['status'] && 'ok' === $diskStatus['status'];

        return $this->json([
            'status' => $isHealthy ? 'ok' : 'unhealthy',
            'timestamp' => (new \DateTime())->format(\DateTimeInterface::ATOM),
            'services' => [
                'database' => $databaseStatus,
                'disk' => $diskStatus,
            ],
            'version' => $_ENV['APP_VERSION'] ?? '1.0.0-dev',
        ], $isHealthy ? 200 : 503);
    }

    private function checkDatabase(): array
    {
        try {
            $this->connection->executeQuery('SELECT 1');

            return ['status' => 'ok'];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Banco de dados inacessível.',
            ];
        }
    }

    private function checkDisk(): array
    {
        $freeSpace = disk_free_space('/');
        $threshold = 100 * 1024 * 1024;

        return [
            'status' => $freeSpace > $threshold ? 'ok' : 'critical',
            'free_mb' => round($freeSpace / 1024 / 1024, 2),
            'threshold_mb' => 100,
        ];
    }
}