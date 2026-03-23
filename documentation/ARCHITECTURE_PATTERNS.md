# Padrões Arquiteturais e Boas Práticas (Cultura de Engenharia)

O projeto Catalyst Skeleton é orientado por princípios de **Clean Code**, **SOLID** e **DRY**, aplicados de forma pragmática para ambientes Symfony e React.

## 1. Padrão `Resultado` (Operation Result)
A lógica central do Catalyst Skeleton é expressa através de objetos de resultado unificados (`src/Resultado.php`).
- **Objetivo**: Evitar o uso de exceções (`try/catch`) para reger o fluxo normal de negócio (ex: 'usuário já cadastrado').
- **Como usar**:
  ```php
  public function executar(NovoPedidoDTO $dto): Resultado
  {
      if ($this->estoqueInsuficiente($dto->item)) {
          return Resultado::falha('estoque_insuficiente');
      }
      return Resultado::sucesso($pedido);
  }
  ```
No Controller, o código HTTP (200, 422, 403) é derivado de `$resultado->ehSucesso()`.

## 2. Early Return e Cláusulas de Guarda
Priorizamos a redução do aninhamento de `if/else`.
- **Regra de Ouro**: Sempre verifique as condições de erro o mais cedo possível e ordene as verificações pelo **custo de processamento**.
- *Check local (rápido) → Check banco (médio) → Check API externa (lento).*

## 3. Specifications (Regras de Negócio Combináveis)
Utilizamos o padrão **Specification** (`src/Specification/`) para encapsular regras que podem ser reutilizadas em Repositories e Services.
- Permite construir consultas complexas e validações de forma declarativa:
  ```php
  $podeComprar = (new UsuarioAtivoSpec())
      ->andX(new UsuarioSemDebitosSpec());
  ```

## 4. Value Objects (Objetos de Valor)
Sempre que um tipo primitivo (`string`, `int`) carregar uma regra de validação complexa, ele deve ser transformado em um **Value Object** (`src/ValueObject/`).
- Exemplos: `Email.php`, `Cpf.php`, `Moeda.php`.
- A validação ocorre no construtor. Se o objeto foi instanciado, ele é válido por definição.

## 5. Services Atômicos (Single Action)
Um Service no Catalyst Skeleton deve representar uma única intenção de negócio.
- Utilize o método `executar()` para centralizar a lógica.
- Evite "God Services" com dezenas de métodos. Se uma classe estiver crescendo demais, decomponha em múltiplos Services injetados.

## 6. Frontend: Imutabilidade e Declaratividade
- **Sem `useEffect`**: O frontend do Catalyst Skeleton deve ser orientado a eventos e handlers. Sincronização direta com o browser é permitida apenas em hooks dedicados (`web/shared/hooks/`).
- **Single Source of Truth**: O estado do servidor deve viver no **TanStack Query**, e o estado local no **Zustand**. Evite duplicar dados entre os dois.
