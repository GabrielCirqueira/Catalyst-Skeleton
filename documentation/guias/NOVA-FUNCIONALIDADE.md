# 🚀 Guia de Implementação de Novas Funcionalidades

Este documento é o guia resumido e prático para implementar qualquer nova tela ou funcionalidade. Para detalhes completos, regras de nomenclatura, padrões avançados e decisões de arquitetura, consulte o [`GUIA-GERAL.md`](./GUIA-GERAL.md).

---

## 📋 Passo a passo geral

```text
1. Entender o que será feito
2. Analisar a estrutura existente (páginas, componentes, responsividade)
3. Implementar o backend (Entidade → Migration → Repository → DTO → Service → Serializer → Controller)
4. Implementar o frontend (Types → api.ts → Hook → Componentes → Responsividade → Página → Rota)
5. Escrever testes (funcional de contrato + integração se houver pipeline async)
6. Validar tudo (lint, tipos, checklist de PR)
7. Verificar observabilidade (logging estruturado, health check)
```

---

## 1) Análise obrigatória antes de começar

- `README.md` — visão geral do produto e funcionalidades existentes
- `web/App.tsx` — rotas já registradas (evitar conflitos)
- `web/pages/` — páginas existentes para manter consistência visual
- `web/shared/components/responsive/` — padrões de layout já implementados

---

## 2) Regras de autenticação e permissão

| Tipo | Comportamento |
| :--- | :--- |
| **Pública** | Qualquer pessoa acessa e usa normalmente |
| **Parcialmente protegida** | Tela visível para todos, mas ações exigem login — mostrar estado bloqueado com CTA de login |
| **Totalmente protegida** | Redireciona para login se não autenticado — proteger a rota em `routes/` |

Lógica de permissão centralizada em `web/routes/`. Nunca dentro de páginas ou componentes.

---

## 3) Backend: ordem de implementação

### 3.1 Entidade

Criar em `src/Entity/{Categoria}/NomeDaEntidade.php`.

Checklist:

- [ ] UUID como chave primária com `doctrine.uuid_generator`
- [ ] Getters **sem** prefixo `get` (ex: `titulo()`, não `getTitulo()`)
- [ ] Setters **com** prefixo `set` retornando `self` — lançar exceção em valores inválidos
- [ ] `criadoEm` e `atualizadoEm` com `#[ORM\PreUpdate]`
- [ ] Relacionamento com `Usuario` via `ManyToOne` + `OneToMany`
- [ ] Método estático `fromDTO`
- [ ] Regras de transição de estado dentro da entidade (não no Service)
- [ ] Value Objects para campos com validação própria (email, CPF, dinheiro) — ver GUIA-GERAL.md 5.1.1
- [ ] Campos com conjunto fixo de valores usam **Enum** (`src/Enum/`) — ver GUIA-GERAL.md 5.1.4

```php
public static function fromDTO(CriarNomeDaEntidadeDTO $dto): self
{
    return (new self())
        ->setTitulo($dto->titulo())
        ->setConteudo($dto->conteudo());
}
```

### 3.2 Migration

```bash
php bin/console doctrine:migrations:diff
php bin/console doctrine:migrations:migrate
```

Sempre revisar o SQL gerado antes de migrar.

### 3.3 Repository

Criar em `src/Repository/{Categoria}/NomeDaEntidadeRepository.php`.

Métodos típicos: `buscarPorUsuario`, `buscarPorUuidEUsuario`, `salvar`, `remover`.

> ⚠️ UUID no Doctrine: sempre converter string para objeto antes de usar em queries:
> `->setParameter('uuid', Uuid::fromString($uuid), 'uuid')`

### 3.4 DTOs

Criar em `src/DataObject/{Categoria}/NomeDaOperacaoDTO.php`.

Checklist:

- [ ] `final readonly class`
- [ ] Validações com `#[Assert\*]` em todas as propriedades
- [ ] Sem setters, getters sem prefixo `get`
- [ ] Campos com conjunto fixo de valores tipados com **Enum** — nunca `string` com `#[Assert\Choice]`

### 3.5 Services

Criar em `src/Service/{Funcionalidade}/NomeDaOperacaoService.php`.

Padrão de nome: **Verbo + Entidade + Service** — `CriarAnimalService`, `DeletarAnimalService`, etc.

Checklist:

- [ ] `final class`, dependências pelo construtor, método `executar()`
- [ ] Zero lógica HTTP (sem Request/Response)
- [ ] **PROIBIDO** `EntityManagerInterface` direto — sempre via Repository
- [ ] Contrato do repositório novo em `src/Interface/{Nome}Interface.php`
- [ ] Erro previsto → `DomainException('codigo', $http)`; o Controller responde com `$this->success()` / `$this->error()` — ver GUIA-GERAL.md 5.9
- [ ] Domain Event disparado quando a ação causa efeitos colaterais — ver GUIA-GERAL.md 5.10
- [ ] Se o Service precisa de lógica pura entre entidades sem I/O, extrair para Domain Service em `src/Domain/` — ver GUIA-GERAL.md 5.12
- [ ] Lógica grande ou repetida → vários services + interface + `TaggedIterator` na Feature — ver PARA-IA.md § 4.7. Não concentrar num arquivo.

### 3.6 Serializer

Criar em `src/Serializer/NomeDaEntidadeSerializer.php`.

Nunca retornar entidade crua. Sempre retornar array padronizado com `uuid`, campos e timestamps.

### 3.7 Controller

Criar em `src/Controller/{Categoria}/NomeDaEntidadeController.php`.

Checklist:

- [ ] Prefixo de rota: `#[Route('/api/v1/nome-da-entidade')]`
- [ ] `#[IsGranted('ROLE_USER')]` nas rotas protegidas
- [ ] `#[MapRequestPayload]` para mapear DTOs
- [ ] Extends `DefaultController`; retornar sempre `Response` via `$this->success()` / `$this->error()` (`{ success, data }` / `{ success, error }`)
- [ ] **Lógica Zero**: recebe Request, chama Service, retorna Response
- [ ] Resolver usuário autenticado via `ResolverUsuarioPorTokenService`

**DomainException → HTTP status:**

| Situação | Status |
| :--- | :---: |
| Dados inválidos / regra violada | `400` |
| Entidade não encontrada | `404` |
| Conflito / já existe | `409` |
| Não autenticado | `401` |
| Sem permissão | `403` |
| Semanticamente inprocessável | `422` |

### 3.8 Message Handlers (Assíncrono)

Criar em `src/MessageHandler/`. Lógica Zero: extrai dados da Message e delega ao Service.

Checklist:

- [ ] Nome terminado em `MessageHandler`, atributo `#[AsMessageHandler]`
- [ ] Apenas extrai dados da Message e chama o Service

---

## 4) Frontend: ordem de implementação

### 4.1 Decidir: feature ou página simples?

Antes de criar qualquer arquivo:

```text
Tem mais de 2 arquivos relacionados (types + hooks + components)?
  └── Sim → features/{feature}/
  └── Não → É reutilizável em múltiplas páginas?
              └── Sim → shared/{components|hooks|utils|types}/
              └── Não → pages/{NomeDaPagina}/
```

### 4.2 Types (TypeScript)

| Tipo | Onde criar |
| :--- | :--- |
| Exclusivo da feature | `web/features/{feature}/types.ts` |
| Reutilizado em múltiplas features | `web/shared/types/index.ts` |
| Envelope de resposta (`RespostaApi<T>`) | `web/shared/types/api.ts` |

Checklist:

- [ ] Interface por entidade (não usar `class`)
- [ ] Propriedades em português, nomes idênticos ao retorno do backend
- [ ] Usar `RespostaApi<T>` / `RespostaPaginada<T>` de `shared/types/api.ts` nos hooks — nunca redefinir a estrutura

### 4.3 Chamadas HTTP (`api.ts`)

Criar em `web/features/{feature}/api.ts`. Não existe mais `web/services/` global.

Checklist:

- [ ] Apenas `.ts` (sem JSX)
- [ ] Usar somente a `axiosInstance` de `config/api.ts` — nunca Axios direto
- [ ] Tipado com `RespostaApi<T>` ou `RespostaPaginada<T>`

### 4.4 Hooks

Criar em `web/features/{feature}/hooks/` (feature) ou `web/shared/hooks/` (genérico).

**Para dados do servidor: usar TanStack Query** — não reinventar cache e revalidação com `useState + useEffect`:

```typescript
export function useBuscarAnimais(filtros: FiltrosAnimais) {
  return useQuery({
    queryKey: ['animais', filtros],
    queryFn: () => animaisApi.listar(filtros).then(r => r.data.dados),
    staleTime: 1000 * 30,
  })
}

export function useCriarAnimal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: animaisApi.criar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animais'] })
      toast.success('Criado com sucesso.')
    },
    onError: () => toast.error('Erro ao criar. Tente novamente.'),
  })
}
```

Checklist:

- [ ] Um hook por operação
- [ ] `toast.success()` e `toast.error()` dentro do hook, nunca no componente
- [ ] Hook não recebe parâmetros `onSuccess` / `onError`
- [ ] Retornar estado de carregamento

### 4.5 Componentes

| Tipo | Onde criar |
| :--- | :--- |
| Exclusivo da feature | `web/features/{feature}/components/` |
| Página simples sem feature | `web/shared/components/page/{NomeDaPagina}/` |
| Reutilizável globalmente | `web/shared/components/{contexto}/` |

Checklist:

- [ ] Nenhum HTML puro (`div`, `span`, `p`, `button`, etc.) — usar `shared/ui/layout` + HeroUI
- [ ] Estilização via `className` + TailwindCSS
- [ ] Animações com `tailwindcss-motion` nas transições de entrada
- [ ] Componente que faz fetch envolto por `ErrorBoundary` — ver GUIA-GERAL.md 6.11
- [ ] Subflow implementado para conteúdo listado ou estruturado — ver GUIA-GERAL.md 6.12

### 4.6 Responsividade

Sempre verificar `web/shared/components/responsive/` antes de criar qualquer componente novo.

- Desktop: layout horizontal / tabela completa
- Mobile: layout empilhado / master-detail / bottom sheet
- Dialog (desktop) → Drawer (mobile) para todos os modais

### 4.7 Página

Criar em `web/pages/{NomeDaPagina}/{NomeDaPagina}.tsx` (se for página simples) ou em `web/features/{feature}/pages/` (se for feature).

```tsx
import { useSEO } from '@/shared/hooks/useSEO'

export function Component() {
  useSEO({
    title: 'Título da Página — Nome do Sistema',
    description: 'Descrição da funcionalidade com 150–160 caracteres.',
    keywords: 'palavra-chave1, palavra-chave2, palavra-chave3',
    // noindex: true  ← usar em rotas privadas/autenticadas
  })

  return (
    <AppContainer>...</AppContainer>
  )
}
```

Checklist:

- [ ] Exportação: `export function Component()`
- [ ] `useSEO` como primeira instrução com `title`, `description` e `keywords`
- [ ] Rotas privadas/autenticadas com `noindex: true`
- [ ] Hierarquia: `AppContainer` → `Container` por seção
- [ ] Lógica movida para hooks — página apenas orquestra a renderização

### 4.8 Rota

Adicionar em `web/App.tsx`.

Checklist:

- [ ] Rota **lazy-loaded**: `lazy={() => import('./pages/...')}`
- [ ] Proteção definida em `web/routes/` — nunca dentro da página
- [ ] Tipo de acesso definido (Pública / Parcialmente protegida / Totalmente protegida)
- [ ] Se rota pública ou parcialmente protegida: URL adicionada ao `public/sitemap.xml`

---

## 5) Validação final

```bash
make lint-all
```

Checklist de PR:

- [ ] `make lint-all` passou sem erros
- [ ] Nenhum HTML puro no frontend (`shared/ui/layout` + HeroUI)
- [ ] Página segue padrão `AppContainer → Container`
- [ ] Hooks consumindo `config/api.ts` — nunca Axios direto
- [ ] Toast gerenciado pelo hook, não pelo componente
- [ ] Error Boundary envolvendo componentes que fazem fetch
- [ ] Subflow implementado para listas e conteúdo estruturado
- [ ] Controllers e MessageHandlers sem regra de negócio (Lógica Zero)
- [ ] DTO com validações e sem setters
- [ ] Getters sem prefixo `get`
- [ ] Entidade com UUID obrigatório e método `fromDTO`
- [ ] Value Objects para campos com validação própria (email, CPF, dinheiro)
- [ ] Entidade com comportamento quando há transição de estado
- [ ] Domain Event disparado quando ação causa efeitos colaterais
- [ ] DomainException mapeada para o status HTTP correto (ver tabela na seção 3.7)
- [ ] Services nomeados no padrão Verbo + Entidade + Service
- [ ] Controller dentro da subpasta de categoria correta
- [ ] Visual agradável + transições + animações
- [ ] `useSEO` configurado com `title`, `description` e `keywords`
- [ ] Rotas privadas/autenticadas com `noindex: true`
- [ ] Novas rotas públicas adicionadas ao `public/sitemap.xml`
- [ ] Testes escritos para a nova funcionalidade
- [ ] `README.md` atualizado com a nova funcionalidade

