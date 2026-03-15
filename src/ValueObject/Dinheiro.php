<?php

declare(strict_types=1);

namespace App\ValueObject;

/**
 * Value Object para valores monetários.
 *
 * Armazena o valor em centavos para evitar erros de ponto flutuante.
 * Imutável — operações retornam novos objetos.
 */
final class Dinheiro
{
    private function __construct(
        private readonly int $centavos,
        private readonly string $moeda,
    ) {}

    public static function deBRL(float $valor): self
    {
        return new self((int) round($valor * 100), 'BRL');
    }

    public static function deCentavos(int $centavos, string $moeda = 'BRL'): self
    {
        return new self($centavos, $moeda);
    }

    public static function zero(string $moeda = 'BRL'): self
    {
        return new self(0, $moeda);
    }

    public function centavos(): int
    {
        return $this->centavos;
    }

    public function valor(): float
    {
        return $this->centavos / 100;
    }

    public function moeda(): string
    {
        return $this->moeda;
    }

    public function somar(self $outro): self
    {
        if ($this->moeda !== $outro->moeda) {
            throw new \InvalidArgumentException(
                "Não é possível somar {$this->moeda} com {$outro->moeda}."
            );
        }

        return new self($this->centavos + $outro->centavos, $this->moeda);
    }

    public function subtrair(self $outro): self
    {
        if ($this->moeda !== $outro->moeda) {
            throw new \InvalidArgumentException(
                "Não é possível subtrair {$this->moeda} com {$outro->moeda}."
            );
        }

        return new self($this->centavos - $outro->centavos, $this->moeda);
    }

    public function percentual(float $porcentagem): self
    {
        return new self((int) round($this->centavos * $porcentagem / 100), $this->moeda);
    }

    public function equals(self $outro): bool
    {
        return $this->centavos === $outro->centavos && $this->moeda === $outro->moeda;
    }
}
