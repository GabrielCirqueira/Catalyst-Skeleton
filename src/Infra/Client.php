<?php

declare(strict_types=1);

namespace App\Infra;

use App\Exception\ClienteHTTPException;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\RequestException;
use Psr\Http\Message\ResponseInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Webmozart\Assert\Assert;

abstract class Client
{
    public function __construct(
        private readonly ClientInterface $client,
        protected readonly string $baseUrl = '',
        protected readonly ?SerializerInterface $serializer = null,
    ) {
    }

    protected function resolverUrl(string $path): string
    {
        if ('' === $this->baseUrl || str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return rtrim($this->baseUrl, '/').'/'.ltrim($path, '/');
    }

    /**
     * @template T
     *
     * @param class-string<T>|null                        $type
     * @param array<string, mixed>                        $options
     * @param callable(RequestException): \Throwable|null $throw
     * @param array<string, mixed>                        $context
     *
     * @return ($type is null ? array<string, mixed> : T)
     */
    protected function request(
        string $method,
        string $uri,
        array $options = [],
        ?string $type = null,
        array $context = [],
        ?callable $throw = null,
    ) {
        $response = $this->executarRequisicao($method, $uri, $options, $throw);
        $body = trim((string) $response->getBody());

        if ('' === $body) {
            $body = '{}';
        }

        if (null === $type) {
            $dados = json_decode($body, true, 512, JSON_THROW_ON_ERROR);
            Assert::isArray($dados, 'Resposta inválida recebida do serviço externo.');

            /* @var array<string, mixed> $dados */
            return $dados;
        }

        return $this->serializer?->deserialize($body, $type, 'json', $context)
            ?? throw new \LogicException('Serializer não configurado para desserializar a resposta.');
    }

    /**
     * @param array<string, mixed> $options
     */
    protected function requestRaw(
        string $method,
        string $uri,
        array $options = [],
        ?callable $throw = null,
    ): string {
        $response = $this->executarRequisicao($method, $uri, $options, $throw);

        return trim((string) $response->getBody());
    }

    /**
     * @param array<string, mixed> $options
     */
    private function executarRequisicao(
        string $method,
        string $uri,
        array $options,
        ?callable $throw,
    ): ResponseInterface {
        try {
            return $this->client->request($method, $uri, $options);
        } catch (RequestException $exception) {
            throw ($throw ?? $this->excecaoPadrao($method, $uri))($exception);
        }
    }

    /**
     * @return callable(RequestException): \Throwable
     */
    private function excecaoPadrao(string $method, string $uri): callable
    {
        return static fn (RequestException $exception): \Throwable => new ClienteHTTPException(
            message: sprintf('Erro ao executar requisição HTTP [%s %s]: %s', $method, $uri, $exception->getMessage()),
            code: (int) $exception->getCode(),
            previous: $exception,
        );
    }
}
