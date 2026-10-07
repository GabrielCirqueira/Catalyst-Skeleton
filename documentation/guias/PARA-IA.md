# Como escrever código neste repositório

Este é o **primeiro arquivo** que uma IA deve ler. Siga na ordem. Não invente pasta, padrão ou biblioteca.

Se faltar detalhe, use a seção **Onde buscar mais contexto** no final deste arquivo — abra só o trecho da tarefa, nunca o arquivo misto inteiro.

---

## 0. Antes de escrever uma linha

1. Classifique a tarefa (backend / frontend / devops) e abra **só** as faixas no final deste arquivo.
2. Backend: um Controller em `src/Controller/` e um Repository em `src/Repository/`. Pule `web/`.
3. Frontend: `web/App.tsx` e a feature mais parecida em `web/features/`. Pule `src/` (exceto se precisar do contrato JSON).
4. Copie o padrão que já existe. Não misture `<div>` cru ou `axios` solto.
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
Controller (rota, sem lógica) → Service atômico (uma ação) → Repository (toda query)
Vários services do mesmo domínio → Feature de orquestração em `src/Feature/{Contexto}/`
Pipeline/estratégias expansíveis → Feature com interface + `TaggedIterator`
I/O externo (HTTP, disco, processo CLI) → `src/Infra/{Sistema}/`
Erro previsto → exceção do contexto com factory estático descritivo
Entidade → Migration → DTO → Serializer
Types → api.ts → Hook (TanStack Query) → Componentes → Página → rota em App.tsx
```

No backend: **crie o Controller primeiro**. Ele chama um Service atômico **ou** a Feature do contexto quando há várias ações. Consulta e persistência **nunca** no Service nem na Feature — só no Repository. **PROIBIDO** arquivo solto na raiz de `src/Controller/`, `src/Service/`, `src/Exception/` ou `src/Feature/`.

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
| Layout e texto | `@chakra-ui/react` (`Box`, `HStack`, `Heading`…) |
| Coisa usada em várias features | `web/shared/` |

Regra: 2+ arquivos do mesmo assunto → `features/{feature}/`. Reutilizável → `shared/`. Não crie `web/pages/` para feature nova.

### Backend (`src/`)

> **Obrigatório:** nenhum arquivo PHP solto na raiz de `src/Controller/`, `src/Service/`, `src/Exception/` ou `src/Feature/`. Sempre uma subpasta de contexto (`Auth/`, `Sistema/`, `Pedido/`, `Storage/`, `HTTP/`). Se a pasta crescer demais, abra subcategorias dentro dela.

| O quê | Onde |
| :--- | :--- |
| HTTP da API | `src/Controller/{Contexto}/` — **sempre** extends `App\Controller\Common\DefaultController` |
| Base HTTP da API | `src/Controller/Common/DefaultController.php` |
| SPA / Twig / health | `src/Controller/Sistema/` |
| Caso de uso (uma ação) | `src/Service/{Contexto}/VerboEntidadeService.php` |
| Orquestração de vários services do mesmo domínio | `src/Feature/{Contexto}/{Nome}Feature.php` |
| Pipeline / estratégias expansíveis | `src/Feature/{Contexto}/{Nome}Feature.php` + interface + `TaggedIterator` |
| Banco | `src/Repository/` — único lugar com Doctrine |
| Contrato PHP (porta com 2+ implementações) | `src/Interface/{Nome}Interface.php` |
| Entrada da API | `src/DataObject/{Contexto}/` — sufixo `DTO` |
| Tabela | `src/Entity/` |
| JSON de saída | `src/Serializer/{Contexto}/` |
| Enum fechado | `src/Enum/` |
| Evento + reação | `src/EventListener/` — fato em `Event/`, reação ao lado |
| HTTP / disco / processo CLI | `src/Infra/{Sistema}/` — HTTP base em `src/Infra/HTTP/Client.php` |
| Exceções | `src/Exception/{Contexto}/{Nome}Exception.php` — factories estáticos descritivos |

---

## 3. Frontend — como construir

### 3.1 Página

A página **não** monta Header nem Footer. `MainLayout` já envolve o `Outlet`.

```tsx
import { Container, Heading, VStack } from '@chakra-ui/react'

export function Component() {
  return (
    <Container maxW="6xl" py="8">
      <VStack gap="6" align="stretch">
        <Heading as="h1" size="2xl">Título</Heading>
      </VStack>
    </Container>
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

Proibido no JSX: `<div>`, `<p>`, `<h1>`–`<h6>`, `<span>`, `className`.

| Precisa de | Use (`@chakra-ui/react`) |
| :--- | :--- |
| Caixa | `Box` |
| Lado a lado | `HStack` |
| Empilhado | `VStack` / `Stack` |
| Flex livre | `Flex` |
| Colunas | `SimpleGrid` / `Grid` |
| Largura máxima | `Container` |
| Texto | `Text` |
| Título | `Heading` |

```tsx
import { Box, Button, Field, Heading, HStack, Input, SimpleGrid, Text, VStack } from '@chakra-ui/react'
```

Estilo: **só props do Chakra** (`p`, `gap`, `bg`, `color`). Cores **somente** da paleta gerada (`skeleton.grey.700`, `skeleton.brand.500`…). Proibido hex e tokens fora da paleta (`fg.muted`, `gray.500`, `red.500` cru do Chakra). `colorPalette` só com escalas da paleta (`brand`, `green`, `red`…). Trocar o nome: `bash scripts/gerar-paleta-brand.sh`. Toast: `toast.success` / `toast.danger` de `@/shared/ui/toaster`. Framer Motion só se o módulo `ui-extra` estiver ativo.

### 3.3 Dados e estado

- **Proibido `useEffect`** em página e feature. Derivado no render / `useMemo`. Evento em `onClick` / `onSubmit`. Fetch no TanStack Query. Montagem pontual: `useMountEffect` ou `useSEO`.
- Página **nunca** chama Axios. Hook da feature chama `api` de `@/config/api`.
- Toast no hook (`toast.success` / `toast.danger` de `@/shared/ui/toaster`), não no JSX da página.
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
| **Controller** | Rota, DTO, chamar **um** Service atômico **ou** a Feature do contexto, `$this->success()` / `$this->error()` | Regra de negócio, query, EntityManager, I/O de disco/HTTP/processo |
| **Service** | **Uma** ação de negócio, devolve o dado (ou DTO de saída) | Query; 8 ações no mesmo arquivo; `new OutroService()`; `$_ENV`/`getenv()` |
| **Feature** | (1) orquestra vários Services atômicos do mesmo domínio **ou** (2) itera estratégias via `TaggedIterator` | Query; lógica toda num arquivo; fachada de 1 linha que descarta retorno |
| **Repository** | Toda consulta e persistência | Regra de negócio HTTP |
| **Infra** | HTTP, filesystem, processo CLI | Regra de domínio |

Comece pelo **Controller**. Uma ação isolada → injeta o Service. Vários Services do mesmo domínio → injeta a **Feature de orquestração**, nunca um Service-fachada.

### 4.1 Controller

Crie o Controller **primeiro** em `src/Controller/{Contexto}/`. Extends `App\Controller\Common\DefaultController`. Corpo: ler DTO → chamar Service ou Feature → `$this->success()` / `$this->created()` / `$this->error()`. Sempre `Response`. Nada além disso.

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

Handler de fila (módulo `async`): zero regra de negócio; chama um Service.

### 4.2 Entidade

- UUID como PK nas entidades **novas** (`doctrine.uuid_generator`).
- Getter **sem** `get`: `nome()`, não `getNome()` — salvo contrato do Symfony (`UserInterface`).
- Setter `setNome(): self`.
- Fábrica `fromDTO`.
- **Tell, Don't Ask:** mudança de estado via método de intenção (`classificarComo()`, `transicionarPara()`), não sequência de `set*()` soltos no Service.
- Conjunto fechado de valores → Enum em `src/Enum/`, não string solta.

### 4.3 Migration

```bash
make new-migration
make migrate
```

Revise o SQL antes de aplicar. Garanta índice/`UNIQUE` para unicidade de domínio (hash, nome, origem).

### 4.4 Repository

**Único** lugar com query. `find`, `createQueryBuilder`, DQL, SQL, `persist`, `flush` — só aqui.

**Proibido** no Service, Feature e Controller: `EntityManagerInterface`, `createQueryBuilder`, `findBy`, consulta crua.

O Service pede dados com método de intenção (`buscarPorUuid`, `usernameJaExiste`, `salvar`).

Lote: `$repository->remover($item, flush: false)` no loop e **um** `$repository->flush()` no final.

Contrato de porta com 2+ implementações (ou substituição em teste) vai em `src/Interface/{Nome}Interface.php`. Não crie interface por dogmatismo quando só existe uma implementação sem plano de extensão.

### 4.5 DTO

`final readonly class` em `src/DataObject/{Contexto}/`, nome `VerboEntidadeDTO`. Sem setters. Getter = nome da propriedade. Validar com `#[Assert\…]`. Entrada HTTP via `MapRequestPayload` / `MapQueryString` — não monte array na mão com `$request->get()`.

**PROIBIDO** no DTO: `file_exists`, `hash_file`, I/O, chamada de serviço. DTO só carrega dados. Hash/arquivo pertencem ao Service ou à Infra.

Retorno composto (upload + duplicado, lote + falhas) → DTO de saída (`ResultadoUploadDTO`), nunca `array{...}` mágico.

### 4.6 Service

Toda lógica de negócio fica **aqui**. Um service = **uma ação**. Nome: `CriarPedidoService`. `final class`, deps no construtor, método `executar()`.

- Sem Request/Response.
- **Sem query.**
- **Sem `new Service()`** — só construtor DI.
- **Sem** `$_ENV` / `getenv()` — parâmetro via `services.yaml` / `#[Autowire('%env(...)%')]`.
- **Sem** `mkdir`, `copy`, `unlink`, `@unlink`, `Process`, `HttpClientInterface` / `$client->request()` — isso é `src/Infra/`.
- **Sem** FQCN inline (`\App\DataObject\Foo`) — `use` no topo.
- Erro previsto → **exceção do contexto** com factory estático (`throw PedidoException::codigoJaCadastrado()`). **PROIBIDO** `throw new \DomainException(...)`, `\RuntimeException`, `\Exception`.
- Guard clauses baratas primeiro (dado local → memória → Repository → API externa).
- Sem `else` — inverta e retorne cedo.
- Valor de comportamento (timeout, permissão, hash, formato de data, extensão, prefixo de pasta) → `private const` no topo da classe, **mesmo que apareça uma vez**.
- **PROIBIDO** constante de código de erro (`ERRO_NAO_ENCONTRADO = 'media_item_nao_encontrado'`). A mensagem vive no factory da exceção.
- Service com 5+ dependências de negócio → vira Feature de orquestração.
- Lote: capture **exceções de domínio/infra esperadas por item**, colete `{processados, falhas}`, continue o loop. **NUNCA** `catch (\Throwable)` cobrindo `TypeError`/`Error`. **NUNCA** abortar o lote inteiro na primeira falha.

```php
public function executar(CriarPedidoDTO $dto): Pedido
{
    if ($this->repositorio->jaExiste($dto->codigo())) {
        throw PedidoException::codigoJaCadastrado();
    }

    $pedido = Pedido::fromDTO($dto);
    $this->repositorio->salvar($pedido);

    return $pedido;
}
```

**PROIBIDO** Service-fachada com 11 métodos de uma linha que só delegam e ainda descartam parte do retorno. Ou o Controller chama o Service atômico, ou a Feature orquestra **sem perder dado**.

### 4.7 Feature — dois formatos oficiais

Os dois moram em `src/Feature/{Contexto}/{Nome}Feature.php`. Sem query. Sem I/O cru.

#### 4.7.1 Orquestração de domínio

Quando um contexto tem **vários Services atômicos** (classificar, apagar, retentar, upload) e o Controller precisaria injetar todos, **a Feature orquestra**. Cada Service continua com uma ação. A Feature coordena e devolve o resultado completo.

Controller/Command injeta **só a Feature** desse contexto — não recrie um `MediaItemService` fachada em `src/Service/`.

#### 4.7.2 TaggedIterator (pipeline / estratégia)

Quando há regras/estratégias expansíveis: interface com tag + vários Services pequenos + Feature que só itera.

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

Nova peça = nova classe. A Feature não muda.

Um único Service atômico (criar pedido, buscar por uuid) **não** vira Feature.

`TaggedLocator` + `#[AsTaggedItem(index: 'pix')]` quando a Feature já sabe a chave.

### 4.8 Serializer

Nunca devolva entidade crua. Array estável: `uuid`, campos, timestamps. Pasta: `src/Serializer/{Contexto}/`.

### 4.9 Infraestrutura (`src/Infra/`) e exceções (`src/Exception/`)

**PROIBIDO** em Service/Command/Feature: HTTP cru, `Process`, `mkdir`/`copy`/`unlink`/`file_exists`/`@unlink`.

1. HTTP base: `src/Infra/HTTP/Client.php` (`request()`, `requestRaw()`).
2. Cliente por sistema: `src/Infra/{Sistema}/{Sistema}Client.php` e `{Sistema}API.php`.
3. Disco: `src/Infra/Storage/` — `criarDiretorio()` usa `0755` via `private const`, valida retorno de `unlink`/`mkdir`/`copy`, lança exceção do contexto se falhar.
4. Processo CLI: `src/Infra/{Ferramenta}/` — timeout e formato viram `private const`.
5. DI: `base_uri` e `%env(...)%` no `services.yaml`. Zero `$_ENV`/`getenv()`.
6. Porta com 2+ implementações: interface em `src/Interface/`.

#### 4.9.1 Exceções personalizadas

**PROIBIDO:** `throw new \DomainException`, `\RuntimeException`, `\Exception` no corpo do método. **PROIBIDO:** slug snake_case (`'erro_salvar_arquivo'`). **PROIBIDO:** factory curto ou com `_` (`erroSalvarArquivo`, `erro_salvar`). **PROIBIDO:** constante de código de erro.

**SEMPRE:**

- Uma classe por contexto em `src/Exception/{Contexto}/{Nome}Exception.php` estendendo `\DomainException`.
- HTTP de cliente: estende `App\Exception\HTTP\ClienteHTTPException` (que já estende `\DomainException`).
- Métodos **estáticos descritivos em camelCase**, frase da causa em português (`falhaAoExtrairMetadataDoVideo()`).
- Primeiro argumento: **frase completa em português**, não identificador. O `KernelExceptionListener` devolve essa frase em `{ error }`.
- Não concatene `$e->getMessage()` de lib externa na mensagem pública; passe a anterior em `$previous` para o log.

```php
namespace App\Exception\Pedido;

class PedidoException extends \DomainException
{
    public static function codigoJaCadastrado(): self
    {
        return new self('Já existe um pedido cadastrado com este código.', 409);
    }

    public static function pedidoNaoEncontradoPorUuid(): self
    {
        return new self('Nenhum pedido foi encontrado com o UUID informado.', 404);
    }
}
```

Chamada: `throw PedidoException::codigoJaCadastrado();`

### 4.10 Constantes (magic values)

Qualquer número/string de **comportamento** vira `private const` no topo da classe, mesmo usado uma vez: timeout, permissão (`0755`), algoritmo (`sha256`), formato de data, extensão padrão, prefixo de diretório.

Chaves de array de metadata compartilhadas → constantes em `src/Support/{Contexto}Keys.php`, nunca `'url_original'` solto em dois Services.

Prefixo de pasta temporária compartilhado → parâmetro em `services.yaml`, não `sys_get_temp_dir().'/projeto_uploads'` copiado em três arquivos.

Se ao ler o método você precisa adivinhar por que aquele valor está ali, ele precisava de nome.

---

## 5. Passo a passo de uma feature nova

1. Entender a tela e o contrato JSON.
2. Backend: **Controller primeiro** em `src/Controller/{Contexto}/`. Service atômico em `src/Service/{Contexto}/`. Vários services do domínio → Feature em `src/Feature/{Contexto}/`. Exceção em `src/Exception/{Contexto}/`. I/O em `src/Infra/`. Repository para toda consulta.
3. Frontend: `types.ts` → `api.ts` → hook → componentes Chakra UI + layout → página `Component` → rota lazy em `App.tsx`.
4. Se a rota for autenticada, registrar em `RotaProtegida`.
5. `make lint-all`. Corrigir o que o Biome/PHP apontar.

---

## 6. Checklist rápido (antes de encerrar)

- [ ] Sem arquivo solto na raiz de `src/Controller/`, `src/Service/`, `src/Exception/`, `src/Feature/`
- [ ] Sem `<div>` / `<p>` / `<h*>` / `<span>` / `className` — só componentes Chakra (`Box`, `HStack`, `Heading`…)
- [ ] Cores só da paleta gerada (`skeleton.grey.700` / `paletteToken(...)`) — sem hex
- [ ] Sem Header/Footer na página
- [ ] Sem `useEffect`
- [ ] Sem Axios fora de `config/api.ts` e dos `api.ts` da feature
- [ ] Controller extends `App\Controller\Common\DefaultController`; chama Service atômico **ou** Feature; `$this->success()` / `$this->error()`
- [ ] Um Service = uma ação; vários do mesmo domínio → Feature de orquestração (não fachada que descarta retorno)
- [ ] Pipeline/estratégia expansível → interface + `TaggedIterator` na Feature
- [ ] Zero query / EntityManager fora do Repository
- [ ] Zero `new Service()`, zero `$_ENV`/`getenv()`
- [ ] Zero `mkdir`/`copy`/`unlink`/`Process`/HTTP cru no Service — só `src/Infra/`
- [ ] Zero `throw new \DomainException` — factory estático descritivo, mensagem frase completa em PT
- [ ] Magic values viraram `private const` (não código de erro)
- [ ] Lote captura exceção **esperada** por item e devolve relatório; um `flush()` no fim
- [ ] DTO sem I/O; retorno composto vira DTO de saída
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
