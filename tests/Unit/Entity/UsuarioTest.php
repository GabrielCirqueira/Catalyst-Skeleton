<?php

declare(strict_types=1);

namespace App\Tests\Unit\Entity;

use App\Entity\Usuario;
use PHPUnit\Framework\TestCase;

final class UsuarioTest extends TestCase
{

    public function testConstrutorDefinePropiedadesBasicas(): void
    {
        $usuario = new Usuario('Gabriel Silva', 'gabriel');

        $this->assertSame('Gabriel Silva', $usuario->getNomeCompleto());
        $this->assertSame('gabriel', $usuario->getUsername());
    }

    public function testConstrutorInicializaDatasDeAuditoria(): void
    {
        $antes = new \DateTimeImmutable();
        $usuario = new Usuario('Ana Costa', 'ana');
        $depois = new \DateTimeImmutable();

        $this->assertGreaterThanOrEqual($antes, $usuario->getCriadoEm());
        $this->assertLessThanOrEqual($depois, $usuario->getCriadoEm());
        $this->assertGreaterThanOrEqual($antes, $usuario->getAtualizadoEm());
        $this->assertLessThanOrEqual($depois, $usuario->getAtualizadoEm());
    }

    public function testNovoUsuarioNaoTemId(): void
    {
        $usuario = new Usuario('Sem ID', 'semid');

        $this->assertNull($usuario->getId());
    }

    public function testGetRolesSempreInclui_ROLE_USER(): void
    {
        $usuario = new Usuario('Teste', 'teste');

        $this->assertContains('ROLE_USER', $usuario->getRoles());
    }

    public function testGetRolesComRolesAdicionais(): void
    {
        $usuario = new Usuario('Admin', 'admin');
        $usuario->setRoles(['ROLE_ADMIN']);

        $roles = $usuario->getRoles();

        $this->assertContains('ROLE_USER', $roles);
        $this->assertContains('ROLE_ADMIN', $roles);
    }

    public function testGetRolesNaoDuplicaROLE_USER(): void
    {
        $usuario = new Usuario('Dup', 'dup');
        $usuario->setRoles(['ROLE_USER']);

        $roles = $usuario->getRoles();

        $this->assertCount(1, array_keys($roles, 'ROLE_USER'));
    }

    public function testGetUserIdentifierRetornaUsername(): void
    {
        $usuario = new Usuario('Pedro Neto', 'pedro');

        $this->assertSame('pedro', $usuario->getUserIdentifier());
    }

    public function testSetNomeCompletoAtualizaTimestamp(): void
    {
        $usuario = new Usuario('Nome Antigo', 'user');
        $antesAtualizacao = $usuario->getAtualizadoEm();

        usleep(1000);
        $usuario->setNomeCompleto('Nome Novo');

        $this->assertGreaterThan($antesAtualizacao, $usuario->getAtualizadoEm());
    }

    public function testSetNomeCompletoRetornaStaticParaFluencia(): void
    {
        $usuario = new Usuario('Fluente', 'fluente');

        $retorno = $usuario->setNomeCompleto('Novo Nome');

        $this->assertSame($usuario, $retorno);
    }

    public function testSetUsernameAtualizaTimestamp(): void
    {
        $usuario = new Usuario('Usuario', 'original');
        $antesAtualizacao = $usuario->getAtualizadoEm();

        usleep(1000);
        $usuario->setUsername('novo_username');

        $this->assertGreaterThan($antesAtualizacao, $usuario->getAtualizadoEm());
    }

    public function testSetPasswordAtualizaTimestamp(): void
    {
        $usuario = new Usuario('Senha', 'senha');
        $antesAtualizacao = $usuario->getAtualizadoEm();

        usleep(1000);
        $usuario->setPassword('hashed_password_xyz');

        $this->assertGreaterThan($antesAtualizacao, $usuario->getAtualizadoEm());
    }

    public function testEraseCredentialsNaoLancaExcecao(): void
    {
        $usuario = new Usuario('Limpa', 'limpa');

        $usuario->eraseCredentials();

        $this->addToAssertionCount(1);
    }
}