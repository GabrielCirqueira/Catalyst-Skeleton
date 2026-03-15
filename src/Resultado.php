<?php

declare(strict_types=1);

namespace App;

/**
 * Encapsula o resultado de uma operação de negócio.
 *
 * Use quando o "erro" é um caso previsto de negócio (e-mail duplicado, estado inválido).
 * Reserve DomainException para violações de invariante inesperadas.
 *
 * Exemplo de uso no Service:
 *   return Resultado::falha('email_duplicado');
 *   return Resultado::sucesso($entidade);
 *
 * Exemplo de uso no Controller:
 *   $resultado = $this->servico->executar($dto);
 *   if (!$resultado->ehSucesso()) {
 *       return $this->json(['sucesso' => false, 'erro' => $resultado->obterErro()], 409);
 *   }
 */
final class Resultado
{
    private function __construct(
        private readonly bool $sucesso,
        private readonly mixed $dados,
        private readonly ?string $erro = null,
    ) {}

    public static function sucesso(mixed $dados = null): self
    {
        return new self(true, $dados);
    }

    public static function falha(string $erro): self
    {
        return new self(false, null, $erro);
    }

    public function ehSucesso(): bool
    {
        return $this->sucesso;
    }

    public function obterDados(): mixed
    {
        return $this->dados;
    }

    public function obterErro(): ?string
    {
        return $this->erro;
    }
}
