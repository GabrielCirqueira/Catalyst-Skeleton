# Testes Automatizados (PHPUnit)

O Catalyst Skeleton privilegia a estabilidade do código através de uma bateria rigorosa de testes unitários e de integração utilizando o **PHPUnit 9.x**.

## Estrutura de Testes (`tests/`)
Divididos em duas suites principais no `phpunit.xml.dist`:

### 1. Testes Unitários (`tests/Unit/`)
- Módulos de lógica pura.
- Devem ser **rápidos** e **sem efeitos colaterais** (sem I/O, rede ou banco de dados).
- Use **Mocks** (via `createMock()`) para isolar as dependências do `Service`.

Exemplo:
```php
public function testCalcularPrecoComDesconto(): void
{
    $service = new CarrinhoService();
    $resultado = $service->aplicarDesconto(100, 0.1);
    $this->assertEquals(90, $resultado);
}
```

### 2. Testes de Integração (`tests/Integration/`)
- Testam a colaboração entre componentes (ex: Service + Repository + Banco).
- Utilizam um banco de dados dedicado de testes (`APP_ENV=test`).
- São executados dentro do container `symfony`.

```bash
make test-integration
```

---

## Estratégias de Teste por Camada

### Services
- Teste os casos de sucesso e os cenários de falha esperados.
- Verifique se o objeto `Resultado` contém o erro correto em falhas de negócio.

### Repositories
- Teste queries customizadas (DQL/QueryBuilder).
- Certifique-se de que os dados persistidos batem com os recuperados.

### Controllers
- Foque em testar o contrato da API: se os códigos HTTP estão corretos (200, 422, 401).
- Utilize o `WebTestCase` do Symfony para realizar requisições HTTP reais contra o kernel.

---

## Dicas e Comandos
- **Rodar tudo**: `make test`.
- **Suite específica**: `make test-unit` ou `make test-integration`.
- **Arquivo específico**: `make bash-backend` → `vendor/bin/phpunit tests/Caminho/Para/Teste.php`.
- **Xdebug**: Para gerar relatórios de cobertura, habilite o Xdebug no Dockerfile e use `make test-coverage`.

## Melhores Práticas
- **AAA Pattern**: Arrange (preparar), Act (executar), Assert (verificar).
- **Testes Atômicos**: Cada teste deve validar apenas uma regra de negócio.
- **Dataromancy**: Evite dependência de dados estáticos; use `Factory` ou crie os dados necessários no `setUp()`.
