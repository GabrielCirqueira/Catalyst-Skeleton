<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;

abstract class DefaultController extends AbstractController
{
    protected function success(mixed $data = null, int $status = Response::HTTP_OK): Response
    {
        return $this->json([
            'success' => true,
            'data' => $data,
        ], $status);
    }

    protected function created(mixed $data = null): Response
    {
        return $this->success($data, Response::HTTP_CREATED);
    }

    protected function noContent(): Response
    {
        return new Response(status: Response::HTTP_NO_CONTENT);
    }

    /**
     * @param array<string, mixed>|null $details
     */
    protected function error(string $error, int $status = Response::HTTP_BAD_REQUEST, ?array $details = null): Response
    {
        $payload = [
            'success' => false,
            'error' => $error,
        ];

        if (null !== $details) {
            $payload['details'] = $details;
        }

        return $this->json($payload, $status);
    }

    /**
     * @param array<string, string>|null $details
     */
    protected function unprocessable(string $error = 'validation_failed', ?array $details = null): Response
    {
        return $this->error($error, Response::HTTP_UNPROCESSABLE_ENTITY, $details);
    }

    protected function notFound(string $error = 'not_found'): Response
    {
        return $this->error($error, Response::HTTP_NOT_FOUND);
    }

    protected function conflict(string $error = 'conflict'): Response
    {
        return $this->error($error, Response::HTTP_CONFLICT);
    }

    protected function unauthorized(string $error = 'unauthorized'): Response
    {
        return $this->error($error, Response::HTTP_UNAUTHORIZED);
    }

    protected function forbidden(string $error = 'forbidden'): Response
    {
        return $this->error($error, Response::HTTP_FORBIDDEN);
    }

    protected function tooManyRequests(string $error = 'too_many_requests'): Response
    {
        return $this->error($error, Response::HTTP_TOO_MANY_REQUESTS);
    }

    protected function internalError(string $error = 'internal_error'): Response
    {
        return $this->error($error, Response::HTTP_INTERNAL_SERVER_ERROR);
    }

    /**
     * @param list<mixed> $items
     */
    protected function paginated(array $items, int $total, int $pagina, int $porPagina): Response
    {
        return $this->json([
            'success' => true,
            'data' => $items,
            'total' => $total,
            'pagina' => $pagina,
            'porPagina' => $porPagina,
        ]);
    }
}
