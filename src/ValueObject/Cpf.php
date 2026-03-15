<?php

declare(strict_types=1);

namespace App\ValueObject;

/**
 * Value Object para CPF.
 *
 * Valida formato e dígitos verificadores do CPF.
 * Armazena apenas os dígitos (sem pontuação).
 */
final class Cpf
{
    private readonly string $valor;

    public function __construct(string $valor)
    {
        $limpo = preg_replace('/\D/', '', $valor) ?? '';

        if (!$this->valido($limpo)) {
            throw new \InvalidArgumentException("CPF inválido: {$valor}");
        }

        $this->valor = $limpo;
    }

    public function valor(): string
    {
        return $this->valor;
    }

    public function formatado(): string
    {
        return substr($this->valor, 0, 3) . '.'
            . substr($this->valor, 3, 3) . '.'
            . substr($this->valor, 6, 3) . '-'
            . substr($this->valor, 9, 2);
    }

    public function equals(self $outro): bool
    {
        return $this->valor === $outro->valor;
    }

    private function valido(string $cpf): bool
    {
        if (strlen($cpf) !== 11 || preg_match('/(\d)\1{10}/', $cpf)) {
            return false;
        }

        for ($t = 9; $t < 11; $t++) {
            $soma = 0;
            for ($i = 0; $i < $t; $i++) {
                $soma += (int) $cpf[$i] * ($t + 1 - $i);
            }
            $resto = ($soma * 10) % 11;
            if ($resto === 10 || $resto === 11) {
                $resto = 0;
            }
            if ($resto !== (int) $cpf[$t]) {
                return false;
            }
        }

        return true;
    }
}
