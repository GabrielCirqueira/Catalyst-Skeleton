# 📌 Guia de Estrutura e Padrões do Sistema

Este documento define o padrão oficial de arquitetura, organização de pastas, nomenclatura e boas práticas do sistema.

---

## 1) Stack Oficial do Projeto

### Backend

* **PHP 8.4** com **Symfony 7.3**
* **MySQL 8.3**
* **Doctrine ORM**
* **LexikJWTAuthenticationBundle** (autenticação)
* **NelmioCorsBundle** (CORS)

### Frontend

* **React 19** com **TypeScript**
* **Vite 6**
* **Axios**
* **Framer Motion**
* **Shadcn UI**
* **TanStack Query v5** (gerenciamento de estado de servidor)
* **Zustand** (gerenciamento de estado global)
* **Biome** (lint e formatação)

### DevOps

* **Docker** e **Docker Compose**
* **Apache 2.4**
* **Supervisor**

---

## 2) Padrão Geral do Projeto

### 2.1 Linguagem e nomenclatura

* **Tudo em português**

  * Pastas
  * Arquivos
  * Variáveis
  * Funções
  * Componentes
  * DTOs
  * Services
  * Entidades

* Nomes devem ser **autoexplicativos** e **descritivos**
* Evitar abreviações confusas

  * Exemplo ruim: `dados`, `info`, `resp`, `obj`, `tmp`
  * Exemplo bom: `usuarioAutenticado`, `filtroRelatorioConversao`, `respostaCadastroUsuario`

---

## 3) Frontend (React)

### 3.1 Localização do frontend

O frontend fica em:

```text
./web
```

### 3.2 Estrutura de pastas padrão

Dentro de `./web`, o projeto segue o padrão de **Features & Shared**:

```text
App.tsx
main.tsx
index.css
vite-env.d.ts

assets/                 ← imagens, fontes, SVGs estáticos
config/                 ← instância axios, constantes globais
contexts/               ← Context API (tema, I18n — não estado de UI)
layouts/                ← sidebar, header, wrappers de página
routes/                 ← proteção de rotas (nunca dentro da página)
shadcn/                 ← componentes UI base (VStack, Box, Button…)
stores/                 ← Zustand stores (useAuthStore, etc.)

features/               ← módulos com feature própria
  {feature}/
    types.ts            ← tipos exclusivos desta feature
    api.ts              ← chamadas HTTP (React Query / Axios)
    hooks/              ← hooks exclusivos desta feature
    components/         ← componentes exclusivos desta feature (ex: Form, Table)
    pages/              ← páginas desta feature

shared/                 ← tudo que é global e sem feature
  components/           ← ErrorBoundary, Layouts, Ui (shadcn)
  hooks/                ← useDebounce, usePaginacao, useSEO
  api/                  ← configuração axios, tipos globais de API
  stores/               ← Zustand stores globais (useAuthStore)
  utils/                ← helpers puros (formatarData, formatarMoeda)
```

#### 3.3 Regra de decisão (onde colocar um arquivo)

* **Tem mais de 2 arquivos relacionados (types + hooks + components)?**
  * Sim → `features/{feature}/`
* **É reutilizável em múltiplas páginas?**
  * Sim → `shared/{components|hooks|utils|types}/`
* **É uma página isolada simples?**
  * Sim → `pages/{NomeDaPagina}/`

#### 3.4 O Banimento do `useEffect`

No Catalyst, o uso direto do `useEffect` em páginas e features é **proibido**.

*   **Estado Derivado:** Calcule diretamente no corpo do componente ou use `useMemo`.
*   **Event Handlers:** Toda lógica de "quando isso acontecer" deve estar em funções de evento (`onClick`, `onSubmit`).
*   **Data Fetching:** Use os hooks do **TanStack Query**.
*   **Sincronização com o DOM/Montagem:** Use hooks abstraídos como `useSEO` ou `useMountEffect`.

**Motivo:** Evita loops infinitos e race conditions, tornando o código previsível para humanos e IAs.

---

## 4) Regras de Rotas

### 4.1 Onde as rotas ficam

* As rotas são declaradas no **App.tsx**
* A pasta `routes/` contém as lógicas auxiliares de rota, principalmente:

  * controle de acesso
  * proteção de páginas
  * bloqueio de acesso sem login/permissão

### 4.2 Regra de permissão

Nenhuma página protegida pode ser acessada se:

* o usuário não estiver logado
* o usuário não tiver permissão

A lógica de permissão deve estar centralizada em `routes/`, e não espalhada em páginas.

---

## 5) Estrutura das Páginas

### 5.1 Onde ficam as páginas

Todas as páginas do sistema ficam em:

```text
/web/pages
```

### 5.2 Padrão obrigatório por página

Cada página deve ser:

* **Uma pasta**
* Dentro da pasta, **um único arquivo `.tsx`**
* O arquivo deve ter o mesmo nome da página
* O componente principal deve ser exportado assim:

```tsx
export function Component() {
  return (...)
}
```

* **Zero Comentários**: O código deve ser autoexplicativo através de bons nomes de variáveis, funções e classes.
* **Proibido**: Comentários explicativos (`//`, `/* ... */`, `{/* ... */}`).
* **Exceção**: Apenas anotações básicas (DocBlocks) em métodos e funções de **Services** e **Utils** são permitidas para documentar parâmetros inusuais ou retornos complexos.
* **Formatação**: Utilize ferramentas de formatação automática (Prettier, PHP-CS-Fixer).

Exemplo de estrutura:

```text
/web/pages
  /Usuarios
    Usuarios.tsx
  /Dashboard
    Dashboard.tsx
```

---

## 6) Hierarquia obrigatória de layout

### 6.1 Estrutura padrão de layout

Toda página **obrigatoriamente** segue essa hierarquia:

* `AppContainer` como container principal da página
* Dentro dele, `Container` para dividir seções

Padrão obrigatório:

```tsx
<AppContainer>
  <Container>Seção 1</Container>
  <Container>Seção 2</Container>
</AppContainer>
```

### 6.2 Regra de seções

* Cada `<Container>` representa uma **seção da página**
* Dentro de cada seção pode existir qualquer estrutura necessária (cards, tabelas, filtros, gráficos, etc.)

---

## 7) Componentização por Página

### 7.1 Quando dividir em componentes

Se a página estiver ficando grande demais, deve ser dividido em componentes.

A regra é:

* A página mantém a estrutura:

  * `AppContainer`
  * `Container` por seção

* O conteúdo grande dentro de um `Container` pode virar um componente separado

Exemplo:

```tsx
<Container>
  <ResumoUsuarios />
</Container>
```

### 7.2 Onde ficam componentes específicos de uma página

Componentes exclusivos de uma página (que não justificam uma `feature`) devem ficar em:

```text
/web/features/{feature}/components/
```

Ou, se for uma página simples em `/web/pages/`:

```text
/web/pages/{NomeDaPagina}/components/
```

### 7.3 Regra de nome dos componentes de página

Componentes de página devem ter nomes claros e descritivos:

✅ Bom:

* `TabelaUsuarios`
* `ModalCadastroUsuario`
* `FiltroRelatorioConversao`
* `ResumoCampanhasPorFilial`

❌ Ruim:

* `Card1`
* `Tabela`
* `Modal`
* `BoxInfo`
* `ComponentX`

---

## 8) Componentes Globais (Reutilizáveis)

Componentes que são usados em múltiplas páginas devem ficar em:

```text
/web/shared/components/{contexto}/
```

Exemplo:

```text
/web/shared/components/formulario/
  CampoTexto.tsx
  CampoSelect.tsx

/web/shared/components/tabela/
  TabelaPadrao.tsx
  PaginacaoTabela.tsx
```

---

## 9) Regras de UI (obrigatórias)

### 9.1 Proibido usar tags HTML padrão

Não usar tags HTML diretamente como:

* `div`
* `span`
* `p`
* `h1`
* `button`
* etc.

### 9.2 Usar somente componentes do sistema

Sempre utilizar os componentes disponíveis em:

```text
/web/shadcn/
```

Exemplos permitidos:

* `VStack`
* `HStack`
* `Box`
* `Text`
* `Title`
* `Button`
* `Spinner`
* `Icon`

### 9.3 Estilização obrigatória

* Todo estilo deve ser feito com:

  * `className`
  * **TailwindCSS**

* O sistema deve sempre manter:

  * transições
  * animações
  * sensação moderna e fluida

---

## 10) Regras de Animação

O sistema deve ter animações consistentes e agradáveis.

Biblioteca oficial:

* **Framer Motion**

Regras:

* evitar telas “secas” sem transição
* aplicar animações com bom senso (não exagerar)
* usar animações principalmente em:

  * entrada de seções
  * abertura de modais
  * carregamentos
  * troca de páginas

---

## 11) Regras de Requisições HTTP

### 11.1 Nunca chamar Axios direto na página

Requisições devem ser feitas usando **hooks**.

### 11.2 Axios centralizado

Todas as requisições devem usar a instância oficial:

* `api.ts` cria a `axiosInstance`
* `api.ts` contém interceptors
* `api.ts` injeta automaticamente o **Bearer Token**

Ou seja:

* hooks devem consumir `api.ts`
* não duplicar axios em outros lugares

---

## 12) Organização de lógica (Frontend)

### 12.1 Hooks

Toda lógica de requisição ou estado local complexo deve ser abstraída em hooks:

* **Hook de Feature:** `/web/features/{feature}/hooks/`
* **Hook Global:** `/web/shared/hooks/`

### 12.2 Chamadas de API

As chamadas de API devem ser organizadas em arquivos `api.ts`:

* **Feature API:** `/web/features/{feature}/api.ts`
* **Configuração Global:** `/web/shared/api/`

### 12.3 Utils de Frontend

Lógicas menores, helpers e formatadores puros devem ficar em:

* **Utils de Feature:** `/web/features/{feature}/utils.ts` (opcional)
* **Utils Globais:** `/web/shared/utils/` (ex: formatadores de data/moeda)

Regras:

* apenas arquivos `.ts`
* funções pequenas e reaproveitáveis

---

## 13) Backend (Symfony)

### 13.1 Controllers

#### Onde ficam os controllers

Os controllers devem ser organizados em subpastas por tópico/categoria dentro de `src/Controller/` (ex: `Admin/`, `Auth/`, `Midia/`, `Nota/`, `Configuracao/`, `Github/`, `Geral/`).

#### Regra principal dos controllers

Controllers **não devem ter lógica extensa**.

Controllers servem para:

* receber Request
* mapear dados para DTO
* validar DTO
* chamar Service
* retornar Response

---

#### 13.2.1 Application vs Domain Service

Confundi-los gera acoplamentos errados.

| Tipo | Responsabilidade | Localização |
| :--- | :--- | :--- |
| **Application Service** | Orquestra casos de uso. Acessa repositórios, APIs, filas. | `src/Service/{Funcionalidade}/` |
| **Domain Service** | Lógica de domínio pura entre múltiplas entidades. Sem I/O. | `src/Domain/{Funcionalidade}/` |

**Regra:** Se pode ser testado unitariamente sem nenhum mock de infraestrutura (banco, HTTP), é um **Domain Service**.

---

### 13.3 Repository

#### Onde ficam os repositories

Repositories ficam em:

```text
/src/Repository
```

#### Regra principal dos repositories

* **Toda** a lógica de acesso a banco e persistência deve estar no Repository.
* **PROIBIDO**: Usar `EntityManagerInterface` diretamente nos Services. Sempre use os métodos do Repository (`salvar`, `remover`, `flush`, etc).

---

### 13.4 DTOs

#### Onde ficam os DTOs

DTOs ficam em:

```text
/src/DataObject
```

#### Nome obrigatório dos DTOs

DTOs devem terminar com `DTO`.

Exemplos:

* `CadastrarUsuarioDTO.php`
* `AtualizarUsuarioDTO.php`
* `FiltroRelatorioDTO.php`

#### DTO obrigatório em requests (POST/PUT/PATCH)

Sempre mapear Request para DTO usando:

* `MapQueryPayload`
* `MapQueryString`

Nunca usar `$request->get()` manualmente para montar dados na mão.

#### DTO com validações (Assert)

Todo DTO deve herdar de `App\DataObject\AbstractDTO` (ou seguir o padrão de validação) com `Assert`.

Exemplo:

```php
public function __construct(
    #[Assert\NotBlank(message: 'O nome é obrigatório.')]
    #[Assert\Length(
        min: 3,
        max: 255,
        minMessage: 'O nome deve ter no mínimo 3 caracteres.',
        maxMessage: 'O nome deve ter no máximo 255 caracteres.'
    )]
    #[Assert\Regex(pattern: "/^[a-zA-ZÀ-ÿ\s]+$/u", message: 'O nome deve conter apenas letras.')]
    public string $nome,
) {}
```

#### DTO sem setters e com getters limpos

DTO **não pode ter setters**.
Getters devem ter o nome da propriedade (sem `get`).

```php
public function nome(): string
{
    return $this->nome;
}
```

---

### 13.5 Entidades

#### UUID obrigatório em todas as entidades

Toda entidade deve ter UUID como chave principal:

```php
#[ORM\Id]
#[ORM\Column(type: 'uuid', unique: true)]
#[ORM\GeneratedValue(strategy: 'CUSTOM')]
#[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
private ?Uuid $uuid = null;
```

#### Getters e Setters

Entidades seguem o padrão:
* Getters: nome da propriedade (ex: `nome()`).
* Setters: prefixo `set` retornando `self` (ex: `setNome(string $nome): self`).

#### Fábrica de Entidade (fromDTO)

Toda entidade deve possuir um método estático `fromDTO` para encapsular a criação inicial a partir de um DTO.

```php
public static function fromDTO(CriarExemploDTO $dto): self {
    return (new self())->setNome($dto->nome());
}
```

#### 13.5.1 Enums para Valores Fixos

Qualquer campo que aceite um conjunto fechado de valores **deve ser um Enum PHP** (em `src/Enum/`).

*   **Na entidade:** tipar a propriedade com o Enum e mapear via Doctrine (`enumType: Sexo::class`).
*   **No DTO:** tipar o campo com o Enum. O Symfony converte o valor da requisição automaticamente.

#### 13.5.2 Value Objects (Objetos de Valor)

Encapsule campos com validação e comportamento em objetos imutáveis (ex: `Email`, `Cpf`, `Dinheiro`).
*   **Imutáveis:** sem setters, dois com o mesmo valor são iguais.
*   **Sem identidade:** definidos pelo que são, não por um ID.

#### 13.5.3 Aggregate Root

Quando entidades só fazem sentido juntas (ex: `Pedido` e `ItemPedido`), todas as alterações devem passar pelo Root (`Pedido`).
*   **Regra:** nunca persista entidades internas (filhas) diretamente pelo Repository; use sempre o Root.

#### 13.5.4 Specification Pattern

Regras de negócio reutilizáveis e combináveis. Use para validar condições complexas de domínio de forma isolada e testável.

---

### 13.6 Message Handlers (Assíncrono)

#### Regra principal dos Handlers

Handlers do Messenger seguem a disciplina de **Lógica Zero**.

* Devem apenas extrair dados da Message.
* Buscar entidades necessárias.
* Delegar todo o processamento para um **Service** de backend específico.

### 13.7 Result Object

Para casos de negócio esperados (ex: e-mail duplicado), retorne um objeto `Resultado` estruturado (`sucesso`, `dados`, `erro`) em vez de lançar exceções. Reserve Exceptions para erros fatais ou invariantes violadas.

### 13.8 Domain Events

Use eventos para desacoplar efeitos colaterais. Se a "Ação A" causa "Ação B", dispache um evento `{Entidade}{VerboPastTense}Event` e deixe um Listener reagir. Isso evita teias complexas de chamadas entre Services.

---

### 13.9 JsonSerializer obrigatório

Todas as entidades precisam ter um **JsonSerializer** contendo todas as propriedades necessárias para serialização.

Regra:

* não retornar entidade “crua”
* sempre garantir que o retorno do backend esteja completo e padronizado

Para garantir que eventos assíncronos não sejam perdidos, persistimos o evento no banco na mesma transação da entidade e um worker separado o publica no Messenger. Use para fluxos críticos de negócio.

#### 13.11 Early Return e Custo de Condições

Sempre ordene as condições de guarda (**Guard Clauses**) pelo custo de processamento.

1.  **Variáveis locais/Flags:** Primeiro (custo zero).
2.  **Dados em memória/Zustand:** Segundo.
3.  **Services secundários:** Terceiro.
4.  **Banco de Dados (Repositories):** Quarto.
5.  **APIs Externas:** Por último.

**Regra:** Nunca chame um serviço custoso antes de validar pre-condições simples que poderiam resultar em um `early return`.

---

## 14) Lints e Qualidade

O projeto possui lints obrigatórios e devem ser usados diariamente.

### Comandos de Verificação

```bash
make lint-php   # Verifica padrão de código PHP (phpcs)
make ts-check   # Verifica tipos TypeScript (tsc)
make lint-all   # Roda todos os verificadores
```

### Correções automáticas (Biome / PHPCS)

```bash
make auto-fix   # Corrige automaticamente o que é possível (biome e phpcbf)
```

---

## 15) Checklist de Pull Request (padrão do time)

Antes de abrir PR:

* [ ] Rode `make lint-all`
* [ ] Não existe HTML puro no frontend (somente shadcn)
* [ ] Página segue padrão `AppContainer -> Container`
* [ ] Hooks consumindo `api.ts`
* [ ] Lógicas grandes movidas para `services/`
* [ ] Helpers pequenos em `utils/`
* [ ] Controllers e MessageHandlers sem regra de negócio (Lógica Zero)
* [ ] DTO com validações e sem setters
* [ ] Getters sem prefixo `get`
* [ ] Entidade com UUID obrigatório e método `fromDTO`
* [ ] Visual agradável + transições + animações

---

## Referências oficiais (documentação)

### Referências de Backend

* Symfony 7.x Docs: [https://symfony.com/doc/current/index.html](https://symfony.com/doc/current/index.html)
* Doctrine ORM: [https://www.doctrine-project.org/projects/doctrine-orm/en/current/index.html](https://www.doctrine-project.org/projects/doctrine-orm/en/current/index.html)
* LexikJWTAuthenticationBundle: [https://github.com/lexik/LexikJWTAuthenticationBundle](https://github.com/lexik/LexikJWTAuthenticationBundle)
* NelmioCorsBundle: [https://github.com/nelmio/NelmioCorsBundle](https://github.com/nelmio/NelmioCorsBundle)
* Symfony Validator / Assert: [https://symfony.com/doc/current/validation.html](https://symfony.com/doc/current/validation.html)

### Referências de Frontend

* React 19 docs: [https://react.dev/](https://react.dev/)
* Vite 6: [https://vite.dev/](https://vite.dev/)
* TanStack Query: [https://tanstack.com/query/latest](https://tanstack.com/query/latest)
* Zustand: [https://zustand-demo.pmnd.rs/](https://zustand-demo.pmnd.rs/)
* Biome JS: [https://biomejs.dev/](https://biomejs.dev/)
* Framer Motion: [https://www.framer.com/motion/](https://www.framer.com/motion/)
* shadcn/ui: [https://ui.shadcn.com/](https://ui.shadcn.com/)
* TailwindCSS: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)

### Referências de DevOps

* Docker: [https://docs.docker.com/](https://docs.docker.com/)
* Docker Compose: [https://docs.docker.com/compose/](https://docs.docker.com/)
* Apache HTTP Server 2.4: [https://httpd.apache.org/docs/2.4/](https://httpd.apache.org/docs/2.4/)
* Supervisor: [http://supervisord.org/](http://supervisord.org/)
