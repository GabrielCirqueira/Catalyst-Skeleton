# Padrões Arquiteturais e Boas Práticas

O Catalyst Skeleton v5 é orientado por princípios de **Clean Code**, **SOLID** e **DRY**, aplicados de forma pragmática para Symfony e React.

---

## 1. Padrão `Resultado` (Operation Result)

A lógica central do backend é expressa através de objetos de resultado unificados (`src/Resultado.php`).

**Objetivo:** Evitar o uso de exceções (`try/catch`) para reger o fluxo normal de negócio (ex: "usuário já cadastrado").

```php
// Service
public function executar(CriarUsuarioDTO $dto): Resultado
{
    if ($this->repositorio->usernameJaExiste($dto->username)) {
        return Resultado::falha('username_duplicado');
    }
    return Resultado::sucesso($usuario);
}

// Controller
$resultado = $this->criarUsuarioService->executar($dto);
if (!$resultado->ehSucesso()) {
    return $this->json(['sucesso' => false, 'erro' => $resultado->obterErro()], 409);
}
```

---

## 2. Early Return e Cláusulas de Guarda

Reduza aninhamento verificando condições de erro o mais cedo possível, ordenadas pelo **custo de processamento**:

```
Check local (rápido) ? Check banco (médio) ? Check API externa (lento)
```

```php
public function executar(int $filialId, bool $isAfastado): Resultado
{
    // 1. Verificação local ? zero custo
    if ($isAfastado) {
        return Resultado::falha('usuario_afastado');
    }

    // 2. Só consulta banco se passou pelo check local
    $permissao = $this->filialRepository->buscarPermissao($filialId);
    if (!$permissao->ativa) {
        return Resultado::falha('filial_inativa');
    }

    // ...
}
```

---

## 3. Services Atômicos (Single Action)

Um Service representa **uma única intenção de negócio**. O método principal é sempre `executar()`.

- Sem "God Services" com dezenas de métodos ? decomponha em múltiplos Services injetados
- Retorno sempre via `Resultado`
- Regra de dependências: Service ? Repository, Service ? outros Services (nunca Controller ? Repository direto)

---

## 4. Serializer como Contrato de API

Todo endpoint que retorna dados de uma entidade **deve** passar por um `src/Serializer/`.

```php
// ? Correto
final class UsuarioSerializer
{
    public function normalizar(Usuario $usuario): array
    {
        return [
            'id'          => $usuario->getId(),
            'nomeCompleto'=> $usuario->getNomeCompleto(),
            'username'    => $usuario->getUsername(),
            'criadoEm'    => $usuario->getCriadoEm()->format(DateTimeInterface::ATOM),
        ];
    }
}

// ? Nunca faça no Controller
return $this->json($usuario); // expõe estrutura interna da entidade
```

O Serializer protege o frontend de mudanças internas (renomear coluna, mover campo) que quebrariam silenciosamente a API.

---

## 5. Frontend: Imutabilidade e Declaratividade

**Sem `useEffect` em pages e features.** Efeitos colaterais descontrolados são a fonte de loops infinitos, race conditions e bugs de dessincronização.

| Em vez de... | Use |
| :--- | :--- |
| `useEffect` para buscar dados | `useQuery` (TanStack Query) |
| `useEffect` para reagir a ações | Event handlers (`onClick`, `onSubmit`) |
| `useEffect` para calcular valores | Estado derivado ou `useMemo` |
| `useEffect` na montagem | `useMountEffect` (`web/shared/hooks/`) |

**Single Source of Truth:**
- Estado do servidor ? **TanStack Query**
- Estado global do cliente ? **Zustand**
- Nunca duplique dados entre os dois
