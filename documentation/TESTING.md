# Testes Automatizados (PHPUnit)

O Catalyst Skeleton utiliza **PHPUnit 11** para garantir a estabilidade do código através de testes unitários e de integração.

## Estrutura de Testes (`tests/`)

Configuração no `.tooling/quality/phpunit.xml.dist`, dividida em duas suites:

### 1. Testes Unitários (`tests/Unit/`)

- Lógica pura ? sem I/O, rede ou banco de dados
- **Rápidos**: devem rodar em milissegundos
- Use `createMock()` para isolar dependências do Service testado

```php
public function testAplicarDesconto(): void
{
    $service = new CarrinhoService();
    $resultado = $service->aplicarDesconto(100, 0.1);
    $this->assertEquals(90.0, $resultado->obterValor());
}
```

### 2. Testes de Integração (`tests/Integration/`)

- Testam colaboração entre componentes (Service + Repository + Banco)
- Usam banco de dados dedicado de testes (`APP_ENV=test`)
- Executados dentro do container `symfony`

```bash
make test-integration
```

---

## Estratégias por Camada

### Services
- Teste o caminho feliz (sucesso) e os cenários de falha esperados
- Valide que `Resultado::falha()` contém o código de erro correto

### Repositories
- Teste queries customizadas (DQL/QueryBuilder)
- Valide que dados persistidos são recuperados corretamente

### Controllers
- Foque no contrato da API: códigos HTTP corretos (200, 201, 409, 422, 401)
- Use `WebTestCase` do Symfony para fazer requisições HTTP reais contra o kernel

---

## Comandos

```bash
make test               # Suite completa (unit + integration)
make test-unit          # Apenas testes sem I/O
make test-integration   # Apenas testes com banco
```

Para arquivo específico:
```bash
make bash
vendor/bin/phpunit tests/Unit/Service/CriarUsuarioServiceTest.php
```

Para cobertura de código (requer Xdebug ativado no Dockerfile):
```bash
make test-coverage
```

---

## Boas Práticas

- **AAA Pattern**: Arrange (preparar) ? Act (executar) ? Assert (verificar)
- **Testes Atômicos**: cada teste valida exatamente uma regra de negócio
- **Sem dados estáticos**: use factories ou crie os dados no `setUp()`
- **Nomenclatura**: `test<O que faz><Em que situação>` ? ex: `testCriarUsuarioRetornaErroSeUsernameJaExiste`
