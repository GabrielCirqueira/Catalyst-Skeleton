<?php

declare(strict_types=1);

namespace App\Tests\Integration;

use Doctrine\DBAL\Configuration as DBALConfiguration;
use Doctrine\DBAL\Schema\DefaultSchemaManagerFactory;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Testes de integração do AuthController.
 *
 * O banco skeleton_test é criado automaticamente no setUp() caso não exista.
 * Para rodar apenas testes que não precisam de banco: make test-unit
 */
final class AuthControllerTest extends WebTestCase
{
    private KernelBrowser $client;

    protected function setUp(): void
    {
        parent::setUp();

        $this->client = static::createClient();

        /** @var EntityManagerInterface $em */
        $em = static::getContainer()->get('doctrine')->getManager();

        $connection = $em->getConnection();
        $params     = $connection->getParams();
        $dbName     = $params['dbname'];

        $tmpParams = $params;
        unset($tmpParams['dbname'], $tmpParams['url']);
        $dbalConfig = new DBALConfiguration();
        $dbalConfig->setSchemaManagerFactory(new DefaultSchemaManagerFactory());
        $tmpConn = \Doctrine\DBAL\DriverManager::getConnection($tmpParams, $dbalConfig);
        $tmpConn->executeStatement(
            "CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
        );
        $tmpConn->close();

        $schemaTool = new \Doctrine\ORM\Tools\SchemaTool($em);
        $metadata   = $em->getMetadataFactory()->getAllMetadata();
        $schemaTool->dropSchema($metadata);
        $schemaTool->createSchema($metadata);
    }

    public function testRegistroComDadosValidosRetorna201(): void
    {

        $this->client->request(
            'POST',
            '/api/auth/registro',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nomeCompleto' => 'Gabriel Silva',
                'username'     => 'gabriel_silva',
                'senha'        => 'SenhaSegura123',
            ]),
        );

        $this->assertResponseStatusCodeSame(201);
        $dados = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertTrue($dados['sucesso']);
    }

    public function testRegistroDuplicadoRetorna409(): void
    {

        $payload = json_encode([
            'nomeCompleto' => 'Usuario Duplicado',
            'username'     => 'duplicado',
            'senha'        => 'SenhaSegura123',
        ]);

        $headers = ['CONTENT_TYPE' => 'application/json'];

        $this->client->request('POST', '/api/auth/registro', [], [], $headers, $payload);
        $this->assertResponseStatusCodeSame(201);

        $this->client->request('POST', '/api/auth/registro', [], [], $headers, $payload);
        $this->assertResponseStatusCodeSame(409);

        $dados = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertFalse($dados['sucesso']);
        $this->assertArrayHasKey('username', $dados['erros']);
    }

    public function testRegistroSemCamposObrigatoriosRetorna422(): void
    {

        $this->client->request(
            'POST',
            '/api/auth/registro',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([]),
        );

        $this->assertResponseStatusCodeSame(422);
        $dados = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertFalse($dados['sucesso']);
        $this->assertArrayHasKey('erros', $dados);
    }

    public function testRegistroComSenhaCurtaRetorna422(): void
    {

        $this->client->request(
            'POST',
            '/api/auth/registro',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nomeCompleto' => 'Usuario Teste',
                'username'     => 'usuario_curto',
                'senha'        => '123',
            ]),
        );

        $this->assertResponseStatusCodeSame(422);
        $dados = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('senha', $dados['erros']);
    }

    public function testRegistroComUsernameInvalidoRetorna422(): void
    {

        $this->client->request(
            'POST',
            '/api/auth/registro',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nomeCompleto' => 'Usuario',
                'username'     => 'usuario com espaço!',
                'senha'        => 'SenhaSegura123',
            ]),
        );

        $this->assertResponseStatusCodeSame(422);
    }

    public function testMeSemAutenticacaoRetorna401(): void
    {

        $this->client->request('GET', '/api/auth/me');

        $this->assertResponseStatusCodeSame(401);
    }

    public function testMeComTokenInvalidoRetorna401(): void
    {

        $this->client->request('GET', '/api/auth/me', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer token_invalido_12345',
        ]);

        $this->assertResponseStatusCodeSame(401);
    }
}