# Padrões Arquiteturais e Boas Práticas

O Catalyst Skeleton v5 é orientado por princípios de **Clean Code**, **SOLID** e **DRY**, aplicados de forma pragmática para Symfony e React.

---

## 1. Envelope HTTP (`DefaultController`)

Controllers de API extends `src/Controller/Common/DefaultController.php` e sempre devolvem `Response`. SPA fica em `src/Controller/Sistema/FrontendController.php`.

```php
public function criar(#[MapRequestPayload] CriarUsuarioDTO $dto): Response
{
    $usuario = $this->criarUsuarioService->executar($dto);

    return $this->created($this->serializer->serializar($usuario));
}
```

JSON: `{ "success": true, "data": ... }` ou `{ "success": false, "error": "username_taken" }`.

Service devolve o dado. Erro previsto: `throw AuthException::nomeDeUsuarioJaCadastrado()`.

---

## 2. Early Return e Cláusulas de Guarda

Reduza aninhamento verificando condições de erro o mais cedo possível, ordenadas pelo **custo de processamento**:

```
Check local (rápido) → Check banco (médio) → Check API externa (lento)
```

```php
public function executar(int $filialId, bool $isAfastado): Pedido
{
    if ($isAfastado) {
        throw new \DomainException('usuario_afastado', 403);
    }

    $permissao = $this->filialRepository->buscarPermissao($filialId);
    if (!$permissao->ativa) {
        throw new \DomainException('filial_inativa', 403);
    }

    // ...
}
```

---

## 3. Services Atômicos (Single Action)

Um Service representa **uma única intenção de negócio**. O método principal é sempre `executar()`.

- Sem "God Services" com dezenas de métodos — decomponha em múltiplos Services injetados
- Devolve o dado; erro previsto via `DomainException`
- Regra de dependências: Service → Repository, Service → outros Services (nunca Controller → Repository direto)

---

## 4. Serializer como Contrato de API

Todo endpoint que retorna dados de uma entidade **deve** passar por um `src/Serializer/`.

```php
final class UsuarioSerializer
{
    public function normalizar(Usuario $usuario): array
    {
        return [
            'id' => $usuario->getId(),
            'nomeCompleto' => $usuario->getNomeCompleto(),
            'username' => $usuario->getUsername(),
            'criadoEm' => $usuario->getCriadoEm()->format(\DateTimeInterface::ATOM),
        ];
    }
}

// Nunca no Controller: return $this->json($usuario);
```

O Serializer protege o frontend de mudanças internas (renomear coluna, mover campo) que quebrariam silenciosamente a API.

---

## 5. Infraestrutura (`src/Infra/`) e exceções

**PROIBIDO** I/O cru em Service ou Command (HTTP, disco, `Process`).

1. `src/Infra/HTTP/Client.php` — Guzzle, `request()` / `requestRaw()`.
2. `src/Infra/{Sistema}/` — cliente e API do sistema.
3. Disco/CLI na Infra; `0755` via constante; sem `@unlink`.
4. `src/Exception/{Contexto}/{Nome}Exception.php` — factory estático descritivo, frase completa em PT. HTTP: `ClienteHTTPException`.
5. Parâmetros só via DI. Zero `$_ENV`/`getenv()`.

---

## 6. Frontend: Imutabilidade e Declaratividade

**Sem `useEffect` em pages e features.** Efeitos colaterais descontrolados são a fonte de loops infinitos, race conditions e bugs de dessincronização.

| Em vez de... | Use |
| :--- | :--- |
| `useEffect` para buscar dados | `useQuery` (TanStack Query) |
| `useEffect` para reagir a ações | Event handlers (`onClick`, `onSubmit`) |
| `useEffect` para calcular valores | Estado derivado ou `useMemo` |
| `useEffect` na montagem | `useMountEffect` (`web/shared/hooks/`) |

**Single Source of Truth:**
- Estado do servidor → **TanStack Query**
- Estado global do cliente → **Zustand**
- Nunca duplique dados entre os dois
