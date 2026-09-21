# Como escrever código neste repositório

Este é o **primeiro arquivo** que uma IA deve ler. Siga na ordem. Não invente pasta, padrão ou biblioteca.

Se faltar detalhe, use a seção **Onde buscar mais contexto** no final deste arquivo — abra só o trecho da tarefa, nunca o arquivo misto inteiro.

---

## 0. Antes de escrever uma linha

1. Classifique a tarefa (backend / frontend / devops) e abra **só** as faixas no final deste arquivo.
2. Backend: um Controller em `src/Controller/` e um Repository em `src/Repository/`. Pule `web/`.
3. Frontend: `web/App.tsx` e a feature mais parecida em `web/features/`. Pule `src/` (exceto se precisar do contrato JSON).
4. Copie o padrão que já existe. Não misture Shadcn, `<div>` ou `axios` solto.
5. Nomes em **português**: pastas, arquivos, variáveis, funções, DTOs, services, entidades.
6. Sem comentários (`//`, `/* */`, `{/* */}`). Código se explica pelo nome. Exceção: DocBlock curto em Service PHP se o retorno for complexo.
7. Não crie testes. Não instale PHPUnit.

---

## 1. Mapa do sistema

```
src/          API Symfony  — JSON em /api/v1/
web/          SPA React    — o usuário só vê isto
```

Fluxo de uma feature completa:

```
Controller (rota, sem lógica) → Service (regra de negócio) → Repository (toda query)
Lógica grande ou repetida → vários services + interface + `TaggedIterator` numa Feature. Nunca um arquivo só.
Entidade → Migration → DTO → Serializer
Types → api.ts → Hook (TanStack Query) → Componentes → Página → rota em App.tsx
```

No backend: **crie o Controller primeiro**. Ele só recebe o request e chama o Service (ou a Feature, se o fluxo for grande). A lógica mora no Service. Consulta e persistência **nunca** no Service nem na Feature — só no Repository.

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
| HTTP da API | `src/Controller/{Categoria}/` — **sempre** extends `DefaultController` |
| SPA / Twig | `src/Controller/FrontendController.php` |
| Caso de uso | `src/Service/{Funcionalidade}/VerboEntidadeService.php` |
| Caso de uso grande / repetido | `src/Feature/{Nome}Feature.php` + vários `*Service` + `TaggedIterator` |
| Banco | `src/Repository/` — único lugar com Doctrine |
| Contrato PHP | `src/Interface/{Nome}Interface.php` |
| Entrada da API | `src/DataObject/` — sufixo `DTO` |
| Tabela | `src/Entity/` |
| JSON de saída | `src/Serializer/` |
| Enum fechado | `src/Enum/` |
| Evento + reação | `src/EventListener/` — fato em `Event/`, reação ao lado |

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
| **Controller** | Rota, DTO, chamar Service ou Feature, `$this->success()` / `$this->error()` | Regra de negócio, query, EntityManager |
| **Service** | Uma ação de negócio, devolve o dado | Query; não empilhar 4+ ações no mesmo arquivo |
| **Feature** | Orquestra vários services via `TaggedIterator` | Query; lógica toda num arquivo só |
| **Repository** | Toda consulta e persistência | Regra de negócio HTTP |

Comece pelo **Controller** (contrato da rota). Em seguida o Service com a lógica. Toda busca (`find`, `createQueryBuilder`, SQL, `persist`, `flush`) vai para um método do Repository — o Service só chama esse método.

### 4.1 Controller

Crie o Controller **primeiro**. Extends `DefaultController`. Corpo: ler DTO → chamar Service (ou Feature) → `$this->success()` / `$this->created()` / `$this->error()`. Sempre `Response`. Nada além disso.

Envelope JSON: `{ success, data }` ou `{ success, error, details? }`. Chaves em **inglês**.

```php
#[Route('/api/v1/pedidos', methods: ['POST'])]
public function criar(#[MapRequestPayload] CriarPedidoDTO $dto): Response
{
    $pedido = $this->criarPedidoService->executar($dto);

    return $this->created($this->serializer->serializar($pedido));
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

Contrato do repositório (e de qualquer porta: cliente HTTP, fila) vai em `src/Interface/{Nome}Interface.php`. O Service/Feature tipa a interface, não a classe concreta.

### 4.5 DTO

`final readonly class` em `src/DataObject/`, nome `VerboEntidadeDTO`. Sem setters. Getter = nome da propriedade. Validar com `#[Assert\…]`. Entrada HTTP via `MapRequestPayload` / `MapQueryString` — não monte array na mão com `$request->get()`.

### 4.6 Service

Toda lógica de negócio fica **aqui**, não no Controller. Um service = **uma ação**. Nome: `CriarPedidoService`. `final class`, deps no construtor, um método `executar()` que devolve o dado.

- Sem Request/Response.
- **Sem query.** Precisa de dado do banco? Chame o Repository. Não monte QueryBuilder, DQL nem `find` no Service.
- Erro previsto (duplicado, estado inválido) → `throw new \DomainException('codigo_duplicado', 409)`. O `KernelExceptionListener` responde `{ success: false, error }`.
- Guard clauses baratas primeiro (dado local → memória → Repository → API externa).

```php
public function executar(CriarPedidoDTO $dto): Pedido
{
    if ($this->repositorio->jaExiste($dto->codigo())) {
        throw new \DomainException('codigo_duplicado', 409);
    }
    $pedido = Pedido::fromDTO($dto);
    $this->repositorio->salvar($pedido);

    return $pedido;
}
```

### 4.7 Feature e tagged iterator

**Proibido** juntar a lógica grande num único Service/arquivo (`if`, `switch`, quatro `executar()`). Sempre que a lógica for grande, repetida ou tiver várias peças, **parta em vários services** com a mesma interface e deixe a Feature só iterar. Como vão ser vários services, **organize sempre assim** — não injete um por um “na mão”.

Fluxo obrigatório:

1. Interface em `src/Interface/` com tag.
2. Um Service pequeno por regra/peça (`src/Service/`).
3. Feature em `src/Feature/` com `#[TaggedIterator]`. Sem query, sem HTTP.

```php
use Symfony\Component\DependencyInjection\Attribute\AutoconfigureTag;

#[AutoconfigureTag('app.regra_desconto')]
interface RegraDescontoInterface
{
    public function suporta(Pedido $pedido): bool;
    public function aplicar(Pedido $pedido): void;
}
```

```php
use Symfony\Component\DependencyInjection\Attribute\TaggedIterator;

final class CalcularDescontoFeature
{
    public function __construct(
        #[TaggedIterator('app.regra_desconto')]
        private readonly iterable $regras,
    ) {}

    public function executar(Pedido $pedido): Pedido
    {
        foreach ($this->regras as $regra) {
            if ($regra->suporta($pedido)) {
                $regra->aplicar($pedido);
            }
        }

        return $pedido;
    }
}
```

Nova peça = nova classe. A Feature não muda. Symfony registra sozinho.

**Quando isso é o padrão (sempre que possível)**

- Lógica grande ou que se repete (desconto, validação, imposto, fraude, permissão).
- Várias peças do mesmo conceito: pagamento, exportação, notificação, frete, parser, webhook.
- Pipeline de etapas (`#[AsTaggedItem(priority: 100)]` define a ordem).
- Outro módulo precisa plugar comportamento sem conhecer a Feature.

Um único Service atômico (criar pedido, buscar por uuid) **não** vira Feature.

**Variações:** `TaggedLocator` + `#[AsTaggedItem(index: 'pix')]` quando a Feature já sabe a chave e só instancia o que usar.

O Controller chama a Feature.

### 4.8 Serializer

Nunca devolva entidade crua. Array estável: `uuid`, campos, timestamps.

---

## 5. Passo a passo de uma feature nova

1. Entender a tela e o contrato JSON.
2. Backend: **Controller primeiro**. Service atômico. Lógica grande/repetida → vários services + interface + `TaggedIterator` na Feature. Nunca um arquivo com toda a lógica. Repository para toda consulta → Entidade / migration / DTO / Serializer.
3. Frontend: `types.ts` → `api.ts` → hook → componentes HeroUI + layout → página `Component` → rota lazy em `App.tsx`.
4. Se a rota for autenticada, registrar em `RotaProtegida`.
5. `make lint-all`. Corrigir o que o Biome/PHP apontar.

---

## 6. Checklist rápido (antes de encerrar)

- [ ] Sem `<div>` / `<p>` / `<h*>` / `<span>` — só primitivos de `@/shared/ui/layout`
- [ ] Sem Header/Footer na página
- [ ] Sem `useEffect`
- [ ] Sem Axios fora de `config/api.ts` e dos `api.ts` da feature
- [ ] Controller extends `DefaultController`; só chama Service ou Feature; retorna `$this->success()` / `$this->error()` (`Response`)
- [ ] Lógica só no Service (ou Feature orquestrando services) — zero query, zero EntityManager
- [ ] Lógica grande ou repetida → vários services + interface + `TaggedIterator` na Feature, nunca um arquivo só
- [ ] Toda consulta/persistência no Repository
- [ ] Contrato novo em `src/Interface/{Nome}Interface.php`
- [ ] DTO validado, sem setter
- [ ] JSON via Serializer, não entidade
- [ ] Nomes em português, descritivos
- [ ] `make lint-all` passou

---

## Onde buscar mais contexto

Leia este arquivo até o fim. Depois abra **só** os trechos da sua tarefa. Não carregue `GUIA-GERAL.md` nem `DOCUMENTACAO_TECNICA.md` inteiros.

Código de referência: backend → `src/Controller/` e `src/Repository/`. Frontend → `web/App.tsx` e uma feature em `web/features/`. Não abra o outro lado se a tarefa for só um deles.

### Backend (Controller, Service, Feature, Repository, DTO, Entity)

| Arquivo | Linhas | Pular |
| :--- | :--- | :--- |
| [Estruturação.md](Estruturação.md) | 448–673 (§ 13) | §§ 3–12 (front) |
| [BACKEND.md](../stack/BACKEND.md) | 1–105 (arquivo curto) | — |
| [GUIA-GERAL.md](GUIA-GERAL.md) | 135–835 (§ 5) | § 6 front, § 7 UI |
| [DOCUMENTACAO_TECNICA.md](../referencia/DOCUMENTACAO_TECNICA.md) | 259–462 (§ 5) | § 6 front |
| [NOVA-FUNCIONALIDADE.md](NOVA-FUNCIONALIDADE.md) | 42–154 (§ 3) | § 4 front |

Auth JWT API: [AUTH.md](../stack/AUTH.md) linhas **1–26**. Pular 28–52.
Fila: [MESSENGER.md](../stack/MESSENGER.md) inteiro (curto).

### Frontend (página, layout, `Box`/`Text`, hook, rota)

| Arquivo | Linhas | Pular |
| :--- | :--- | :--- |
| [Estruturação.md](Estruturação.md) | 59–446 (§§ 3–12) | § 13 back |
| [FRONTEND.md](../stack/FRONTEND.md) | 1–182 (arquivo curto) | — |
| [DESIGN.md](DESIGN.md) | 1–720 se for visual/UI | — |
| [GUIA-GERAL.md](GUIA-GERAL.md) | 837–1570 (§§ 6–7) | § 5 back |
| [DOCUMENTACAO_TECNICA.md](../referencia/DOCUMENTACAO_TECNICA.md) | 464–718 (§ 6) | § 5 back |
| [NOVA-FUNCIONALIDADE.md](NOVA-FUNCIONALIDADE.md) | 156–293 (§ 4) | § 3 back |

Auth tela / store / interceptors: [AUTH.md](../stack/AUTH.md) linhas **28–52**. Pular 1–26.

### DevOps, Docker, portas

| Arquivo | Linhas | Pular |
| :--- | :--- | :--- |
| [DOCKER.md](../ops/DOCKER.md) | 1–55 (arquivo curto) | — |
| [DOCUMENTACAO_TECNICA.md](../referencia/DOCUMENTACAO_TECNICA.md) | 190–257 (env/portas); 1100–1248 (§§ 11–12) | §§ 5–6 app |
| [STRUCTURE.md](../referencia/STRUCTURE.md) | 7–82 (raiz, tooling) | — |

### Deploy / produção

| Arquivo | Linhas |
| :--- | :--- |
| [DEPLOY.md](../ops/DEPLOY.md) | 1–770 |
| [MAKEFILE.md](../ops/MAKEFILE.md) | 39–48 |

### Lint / Makefile / CLI

| Arquivo | Linhas |
| :--- | :--- |
| [FORMATTING.md](../ops/FORMATTING.md) | 1–44 |
| [MAKEFILE.md](../ops/MAKEFILE.md) | 1–38 |
| [CLI.md](../ops/CLI.md) | 1–28 |

### Árvore de pastas

[STRUCTURE.md](../referencia/STRUCTURE.md): **84–106** (`src/`) · **108–126** (`web/`). O resto, pular.
