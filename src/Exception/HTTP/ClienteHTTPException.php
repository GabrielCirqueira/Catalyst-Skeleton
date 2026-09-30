<?php

declare(strict_types=1);

namespace App\Exception\HTTP;

class ClienteHTTPException extends \DomainException
{
    public static function falhaAoExecutarRequisicaoHttp(string $metodo, string $uri, \Throwable $anterior): self
    {
        return new self(
            sprintf('Falha ao executar a requisição HTTP %s %s.', $metodo, $uri),
            502,
            $anterior,
        );
    }
}
