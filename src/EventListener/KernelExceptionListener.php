<?php

declare(strict_types=1);

namespace App\EventListener;

use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Validator\Exception\ValidationFailedException;

#[AsEventListener(event: KernelEvents::EXCEPTION)]
final class KernelExceptionListener
{
    public function __construct(
        private readonly LoggerInterface $logger,
    ) {}

    public function __invoke(ExceptionEvent $event): void
    {
        $exception = $event->getThrowable();
        $request = $event->getRequest();

        if (!str_starts_with($request->getPathInfo(), '/api/')) {
            return;
        }

        $statusCode = Response::HTTP_INTERNAL_SERVER_ERROR;
        $mensagem = 'Ocorreu um erro interno no servidor.';
        $detalhes = null;

        if ($exception->getPrevious() instanceof ValidationFailedException) {
            $exception = $exception->getPrevious();
        }

        if ($exception instanceof ValidationFailedException) {
            $statusCode = Response::HTTP_UNPROCESSABLE_ENTITY;
            $mensagem = 'Dados de formulário inválidos.';
            $detalhes = [];
            
            foreach ($exception->getViolations() as $violation) {
                $detalhes[$violation->getPropertyPath()] = $violation->getMessage();
            }
        } elseif ($exception instanceof \DomainException) {
            $code = $exception->getCode();
            $statusCode = (in_array($code, [400, 401, 403, 404, 409, 422], true)) 
                ? (int) $code 
                : Response::HTTP_BAD_REQUEST;
                
            $mensagem = $exception->getMessage();
            
            $this->logger->warning('Domain Exception capturada', [
                'message' => $mensagem,
                'code' => $statusCode,
                'path' => $request->getPathInfo(),
            ]);
        } elseif ($exception instanceof HttpExceptionInterface) {
            $statusCode = $exception->getStatusCode();
            $mensagem = $exception->getMessage();
        } else {
            $this->logger->error('Erro interno na API', [
                'message' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'trace' => $exception->getTraceAsString(),
            ]);
        }

        $data = [
            'sucesso' => false,
            'erro'    => $mensagem,
            'codigo'  => $statusCode,
        ];

        if ($detalhes) {
            $data['detalhes'] = $detalhes;
        }

        $event->setResponse(new JsonResponse($data, $statusCode));
    }
}
