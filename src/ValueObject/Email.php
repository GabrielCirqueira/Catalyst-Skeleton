<?php

declare(strict_types=1);

namespace App\ValueObject;

/**
 * Value Object para e-mail.
 *
 * Imutável e com validação embutida — dois objetos com o mesmo valor são intercambiáveis.
 * Use como tipo de campo nas entidades em vez de string solta.
 */
final class Email
{
    private readonly string $valor;

    public function __construct(string $valor)
    {
        if (!filter_var($valor, FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException("E-mail inválido: {$valor}");
        }
        $this->valor = strtolower(trim($valor));
    }

    public function valor(): string
    {
        return $this->valor;
    }

    public function equals(self $outro): bool
    {
        return $this->valor === $outro->valor;
    }

    public function __toString(): string
    {
        return $this->valor;
    }
}
