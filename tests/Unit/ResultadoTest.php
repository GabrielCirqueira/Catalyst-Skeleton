<?php

declare(strict_types=1);

namespace App\Tests\Unit;

use App\Resultado;
use PHPUnit\Framework\TestCase;

final class ResultadoTest extends TestCase
{
    public function testSucessoSemDados(): void
    {
        $resultado = Resultado::sucesso();

        $this->assertTrue($resultado->ehSucesso());
        $this->assertNull($resultado->obterDados());
        $this->assertNull($resultado->obterErro());
    }

    public function testSucessoComDados(): void
    {
        $dados = ['id' => 42, 'nome' => 'Gabriel'];

        $resultado = Resultado::sucesso($dados);

        $this->assertTrue($resultado->ehSucesso());
        $this->assertSame($dados, $resultado->obterDados());
        $this->assertNull($resultado->obterErro());
    }

    public function testSucessoComDadosPrimitivos(): void
    {
        $resultado = Resultado::sucesso(99);

        $this->assertTrue($resultado->ehSucesso());
        $this->assertSame(99, $resultado->obterDados());
    }

    public function testSucessoComObjeto(): void
    {
        $objeto = new \stdClass();
        $objeto->x = 1;

        $resultado = Resultado::sucesso($objeto);

        $this->assertSame($objeto, $resultado->obterDados());
    }

    public function testFalhaComCodigoDeErro(): void
    {
        $resultado = Resultado::falha('email_duplicado');

        $this->assertFalse($resultado->ehSucesso());
        $this->assertSame('email_duplicado', $resultado->obterErro());
        $this->assertNull($resultado->obterDados());
    }

    public function testFalhaComMensagemDetalhada(): void
    {
        $resultado = Resultado::falha('usuario_nao_encontrado');

        $this->assertFalse($resultado->ehSucesso());
        $this->assertSame('usuario_nao_encontrado', $resultado->obterErro());
    }

    public function testSucessoNaoTemErro(): void
    {
        $resultado = Resultado::sucesso('qualquer dados');

        $this->assertNull($resultado->obterErro());
    }

    public function testFalhaNaoTemDados(): void
    {
        $resultado = Resultado::falha('algum_erro');

        $this->assertNull($resultado->obterDados());
    }

    public function testCadaResultadoEhInstanciaIndependente(): void
    {
        $r1 = Resultado::sucesso('a');
        $r2 = Resultado::sucesso('b');

        $this->assertNotSame($r1, $r2);
        $this->assertSame('a', $r1->obterDados());
        $this->assertSame('b', $r2->obterDados());
    }
}
