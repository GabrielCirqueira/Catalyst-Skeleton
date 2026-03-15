<?php

declare(strict_types=1);

namespace App\Tests\Integration;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class HealthControllerTest extends WebTestCase
{
    public function testHealthEndpointRetornaOk(): void
    {
        $client = static::createClient();

        $client->request('GET', '/api/v1/health');

        $this->assertResponseIsSuccessful();
        $this->assertResponseStatusCodeSame(200);
        $this->assertJson($client->getResponse()->getContent());

        $dados = json_decode($client->getResponse()->getContent(), true);
        $this->assertSame('ok', $dados['status']);
    }

    public function testHealthEndpointRetornaJsonCorreto(): void
    {
        $client = static::createClient();

        $client->request('GET', '/api/v1/health');

        $this->assertResponseHeaderSame('Content-Type', 'application/json');
        $this->assertJsonStringEqualsJsonString(
            '{"status":"ok"}',
            $client->getResponse()->getContent(),
        );
    }

    public function testHealthEndpointEhPublico(): void
    {
        $client = static::createClient();

        $client->request('GET', '/api/v1/health', [], [], [
            'HTTP_ACCEPT' => 'application/json',
        ]);

        $this->assertResponseStatusCodeSame(200);
    }

}