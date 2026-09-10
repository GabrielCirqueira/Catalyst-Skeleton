# Como escrever código neste repositório

Este é o **primeiro arquivo** que uma IA deve ler. Siga na ordem. Não invente pasta, padrão ou biblioteca.

Detalhamento extra (só se faltar): [Estruturação.md](Estruturação.md) · [FRONTEND.md](../stack/FRONTEND.md) · [BACKEND.md](../stack/BACKEND.md).

---

## 0. Antes de escrever uma linha

1. Leia `web/App.tsx` (rotas) e a feature mais parecida em `web/features/`.
2. Leia um Controller em `src/Controller/` e um Repository em `src/Repository/`.
3. Copie o padrão que já existe. Não misture Shadcn, `<div>` ou `axios` solto.
4. Nomes em **português**: pastas, arquivos, variáveis, funções, DTOs, services, entidades.
5. Sem comentários (`//`, `/* */`, `{/* */}`). Código se explica pelo nome. Exceção: DocBlock curto em Service PHP se o retorno for complexo.
6. Não crie testes. Não instale PHPUnit.

---

## 1. Mapa do sistema

```
src/          API Symfony  — JSON em /api/v1/
web/          SPA React    — o usuário só vê isto
```

Fluxo de uma feature completa:

```
Controller (rota, sem lógica) → Service (regra de negócio) → Repository (toda query)
Entidade → Migration → DTO → Serializer
Types → api.ts → Hook (TanStack Query) → Componentes → Página → rota em App.tsx
```

No backend: **crie o Controller primeiro**. Ele só recebe o request e chama o Service. A lógica mora no Service. Consulta e persistência **nunca** no Service — só no Repository.

---

## 2. Onde colocar cada arquivo

### Frontend (`web/`)

| O quê | Onde |
| :--- | :--- |
| Página / tela de um módulo | `web/features/{feature}/Nome.tsx` |
| Types, api, hooks, componentes só dessa tela | `web/features/{feature}/` |
| Rota | só em `web/App.tsx` (lazy) |
| Guard de login | `web/routes/` — nunca dentro da página |
| Header / Footer / casca | `web/layouts/` — **não recrie** na página |
| Axios, JWT | `web/config/api.ts` — único cliente HTTP |
| Auth global | `web/stores/useAuthStore.ts` |
| Layout e texto | `web/shared/ui/layout.tsx` |
| Coisa usada em várias features | `web/shared/` |

Regra: 2+ arquivos do mesmo assunto → `features/{feature}/`. Reutilizável → `shared/`. Não crie `web/pages/` para feature nova.

### Backend (`src/`)

| O quê | Onde |
| :--- | :--- |
| HTTP | `src/Controller/{Categoria}/` |
| Caso de uso | `src/Service/{Funcionalidade}/VerboEntidadeService.php` |
| Banco | `src/Repository/` — único lugar com Doctrine |
| Entrada da API | `src/DataObject/` — sufixo `DTO` |
| Tabela | `src/Entity/` |
| JSON de saída | `src/Serializer/` |
| Enum fechado | `src/Enum/` |
| Sucesso/falha de negócio | `src/Resultado.php` |

---

## 3. Frontend — como construir

### 3.1 Página

A página **não** monta Header nem Footer. `MainLayout` já envolve o `Outlet`.

```tsx
import { AppContainer } from '@/layouts'
import { Container, Text, VStack } from '@/shared/ui/layout'

export function Component() {
  return (
    <AppContainer>
      <Container>
        <VStack className="gap-6">
          <Text as="h1" className="text-3xl font-bold">Título</Text>
        </VStack>
      </Container>
    </AppContainer>
  )
}
```

- Um `Container` = uma seção.
- Conteúdo grande de uma seção vira componente em `features/{feature}/components/`.
- Nomes concretos: `TabelaUsuarios`, `ModalCadastroPedido`. Nunca `Card1`, `Tabela`, `Modal`.

Rota lazy em `App.tsx`:

```tsx
<Route path="pedidos" lazy={() => lazyWithRetry(() => import('@/features/pedidos/Pedidos'))} />
```

Página autenticada: envolva com `<RotaProtegida />` como `/app`.

### 3.2 UI (obrigatório)

Proibido no JSX: `<div>`, `<p>`, `<h1>`–`<h6>`, `<span>`.

| Precisa de | Use |
| :--- | :--- |
| Caixa | `Box` |
| Lado a lado | `HStack` |
| Empilhado | `VStack` |
| Flex livre | `Flex` |
| Colunas | `Grid` |
| Largura máxima | `Container` |
| Texto / título | `Text` / `Text as="h1"` / `Text as="span"` |

```tsx
import { Box, HStack, VStack, Flex, Grid, Container, Text } from '@/shared/ui/layout'
```

Exceção: `<main>`, `<header>`, `<footer>`, `<nav>`, `<section>` só se forem semântica real. Botões, inputs e cards: **HeroUI** (`@heroui/react`), não HTML cru e não Shadcn.

Estilo: só `className` + Tailwind 4. Animação padrão: classes `tailwindcss-motion`. Framer Motion só se o módulo `ui-extra` estiver ativo e houver montar/desmontar de verdade.

### 3.3 Dados e estado

- **Proibido `useEffect`** em página e feature. Derivado no render / `useMemo`. Evento em `onClick` / `onSubmit`. Fetch no TanStack Query. Montagem pontual: `useMountEffect` ou `useSEO`.
- Página **nunca** chama Axios. Hook da feature chama `api` de `@/config/api`.
- Toast no hook (`toast.success` / `toast.danger`), não no JSX da página.
- Zustand só para estado global de verdade (auth). Não abra store por feature “por precaução”.

```tsx
// features/pedidos/api.ts
import { api } from '@/config/api'
export const listarPedidos = () => api.get('/api/v1/pedidos')

// features/pedidos/hooks/usePedidos.ts
export function usePedidos() {
  return useQuery({ queryKey: ['pedidos'], queryFn: listarPedidos })
}
```

---

## 4. Backend — como construir

Três camadas, sem exceção:

| Camada | Faz | Não faz |
| :--- | :--- | :--- |
| **Controller** | Rota, DTO, chamar Service, devolver JSON | Regra de negócio, query, EntityManager |
| **Service** | Orquestrar o caso de uso, `Resultado` | Query, DQL, QueryBuilder, EntityManager |
| **Repository** | Toda consulta e persistência | Regra de negócio HTTP |

Comece pelo **Controller** (contrato da rota). Em seguida o Service com a lógica. Toda busca (`find`, `createQueryBuilder`, SQL, `persist`, `flush`) vai para um método do Repository — o Service só chama esse método.

### 4.1 Controller

Crie o Controller **primeiro**. Ele define a rota e o formato da resposta. Corpo: ler DTO → chamar Service → JSON. Nada além disso.

```php
#[Route('/api/v1/pedidos', methods: ['POST'])]
public function criar(#[MapRequestPayload] CriarPedidoDTO $dto): JsonResponse
{
    $resultado = $this->criarPedidoService->executar($dto);
    if (!$resultado->ehSucesso()) {
        return $this->json(['sucesso' => false, 'erro' => $resultado->obterErro()], 409);
    }
    return $this->json(['sucesso' => true, 'dados' => $this->serializer->serializar($resultado->obterDados())], 201);
}
```

Rotas: prefixo `/api/v1/`, recurso no **plural**.

Handler de fila (módulo `async`): mesma regra — zero regra de negócio; chama um Service.

### 4.2 Entidade

- UUID como PK nas entidades **novas** (`doctrine.uuid_generator`).
- Getter **sem** `get`: `nome()`, não `getNome()` — salvo contrato do Symfony (`UserInterface`).
- Setter `setNome(): self`.
- Fábrica `fromDTO`.
- Conjunto fechado de valores → Enum em `src/Enum/`, não string solta.

### 4.3 Migration

```bash
make new-migration
make migrate
```

Revise o SQL antes de aplicar.

### 4.4 Repository

**Único** lugar com query. `find`, `createQueryBuilder`, DQL, SQL, `persist`, `flush` — só aqui.

**Proibido** no Service e no Controller: `EntityManagerInterface`, `createQueryBuilder`, `findBy`, consulta crua.

O Service pede dados com um método de intenção (`buscarPorUuid`, `usernameJaExiste`, `salvar`). Se a consulta ainda não existe, crie no Repository — não escreva a query no Service.

### 4.5 DTO

`final readonly class` em `src/DataObject/`, nome `VerboEntidadeDTO`. Sem setters. Getter = nome da propriedade. Validar com `#[Assert\…]`. Entrada HTTP via `MapRequestPayload` / `MapQueryString` — não monte array na mão com `$request->get()`.

### 4.6 Service

Toda lógica de negócio fica **aqui**, não no Controller. Um service = **uma ação**. Nome: `CriarPedidoService`. `final class`, deps no construtor, um método `executar(): Resultado`.

- Sem Request/Response.
- **Sem query.** Precisa de dado do banco? Chame o Repository. Não monte QueryBuilder, DQL nem `find` no Service.
- Erro previsto (duplicado, estado inválido) → `Resultado::falha('codigo')`.
- Erro absurdo (invariante quebrada) → exceção.
- Guard clauses baratas primeiro (dado local → memória → Repository → API externa).

```php
public function executar(CriarPedidoDTO $dto): Resultado
{
    if ($this->repositorio->jaExiste($dto->codigo())) {
        return Resultado::falha('codigo_duplicado');
    }
    $pedido = Pedido::fromDTO($dto);
    $this->repositorio->salvar($pedido);
    return Resultado::sucesso($pedido);
}
```

### 4.7 Serializer

Nunca devolva entidade crua. Array estável: `uuid`, campos, timestamps.

---

## 5. Passo a passo de uma feature nova

1. Entender a tela e o contrato JSON.
2. Backend: **Controller primeiro** (rota, sem lógica) → Service (toda a lógica, sem query) → Repository (toda consulta) → Entidade / migration / DTO / Serializer.
3. Frontend: `types.ts` → `api.ts` → hook → componentes HeroUI + layout → página `Component` → rota lazy em `App.tsx`.
4. Se a rota for autenticada, registrar em `RotaProtegida`.
5. `make lint-all`. Corrigir o que o Biome/PHP apontar.

---

## 6. Checklist rápido (antes de encerrar)

- [ ] Sem `<div>` / `<p>` / `<h*>` / `<span>` — só primitivos de `@/shared/ui/layout`
- [ ] Sem Header/Footer na página
- [ ] Sem `useEffect`
- [ ] Sem Axios fora de `config/api.ts` e dos `api.ts` da feature
- [ ] Controller criado primeiro; só chama Service
- [ ] Lógica só no Service — zero query, zero EntityManager
- [ ] Toda consulta/persistência no Repository
- [ ] DTO validado, sem setter
- [ ] JSON via Serializer, não entidade
- [ ] Nomes em português, descritivos
- [ ] `make lint-all` passou
