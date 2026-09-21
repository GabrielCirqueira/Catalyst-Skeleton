  # 📚 Guia Geral

  Este é o documento canônico do projeto. Define arquitetura, padrões, nomenclatura, regras de qualidade e o processo completo para implementar qualquer nova funcionalidade. Qualquer divergência entre outros documentos e este deve ser resolvida em favor deste.

  ---

  ## 📋 Processo de implementação (visão geral)

  ```text
  1. Entender o que será feito
  2. Analisar a estrutura existente (páginas, componentes, responsividade)
  3. Implementar o backend (Entidade → Migration → Repository → DTO → Service → Serializer → Controller)
  4. Implementar o frontend (Types → Service → Hook → Componentes → Responsividade → Página → Rota)
  5. Validar tudo (lint, tipos, checklist de PR)
  6. Verificar observabilidade (logging estruturado, health check) (ver seção 11)
  ```

  ---

  ## 1) Stack Oficial

  ### Backend

  * **PHP 8.4** com **Symfony 7.3**
  * **MySQL 8.3**
  * **Doctrine ORM**
  * **LexikJWTAuthenticationBundle** (autenticação)
  * **NelmioCorsBundle** (CORS)

  ### Frontend

  * **React 19** com **TypeScript**
  * **Vite**
  * **TanStack Query** (gerenciamento de estado do servidor e cache)
  * **Zustand** (gerenciamento de estado global)
  * **Axios** (via instância centralizada `api.ts`)
  * **HeroUI v3** (componentes base acessíveis, inclui toast)
  * **Tailwind CSS 4** + **tailwindcss-motion** (estilo e animações padrão)
  * **Recharts** (gráficos)

  ### DevOps

  * **Docker** e **Docker Compose**
  * **Apache 2.4**
  * **Supervisor**

  ---

  ## 2) Padrão Geral de Nomenclatura

  * **Tudo em português**: pastas, arquivos, variáveis, funções, componentes, DTOs, services, entidades.
  * Nomes devem ser **autoexplicativos** e **descritivos**.
  * Evitar abreviações confusas.

    * ❌ Ruim: `dados`, `info`, `resp`, `obj`, `tmp`
    * ✅ Bom: `usuarioAutenticado`, `filtroRelatorioConversao`, `respostaCadastroUsuario`

  * **Zero comentários** no código — o código deve se explicar pelos nomes.
    * Exceção: DocBlocks em métodos de **Services** e **Utils** para documentar parâmetros inusuais ou retornos complexos.

  ---

  ## 3) Análise obrigatória antes de começar

  ### Leitura obrigatória

  * `README.md` — visão geral do produto e funcionalidades existentes

  ### Mapa de rotas existentes (`web/App.tsx`)

  Antes de criar qualquer página, consulte o arquivo `web/App.tsx` para verificar todas as rotas já registradas e evitar conflitos. Todas as rotas devem ser **lazy-loaded** via `lazy={() => import()}` e o `Router` deve usar `createBrowserRouter` com `createRoutesFromElements`.

  ### Páginas de referência visual

  Antes de criar qualquer nova página, analise as páginas já implementadas em `web/pages/` para manter consistência de design. Verifique especialmente páginas com hero section, páginas de ferramentas, páginas protegidas com sidebar e páginas com tabelas e filtros.

  ### Análise de responsividade existente

  Sempre analise a pasta `web/shared/components/responsive/` antes de criar qualquer componente novo, verificando os padrões de layout, tabelas, modais e workspaces já implementados.

  ---

  ## 4) Autenticação e Permissão

  ### Tipos de acesso

  | Tipo | Comportamento |
  | :--- | :--- |
  | **Pública** | Qualquer pessoa acessa e usa normalmente |
  | **Parcialmente protegida** | Tela visível para todos, mas ações (criar, salvar, etc.) exigem login — mostrar estado bloqueado com CTA de login |
  | **Totalmente protegida** | Redireciona para login se não autenticado — proteger a rota em `routes/` |

  ### Estado bloqueado (parcialmente protegida)

  Quando o usuário não está logado mas pode ver a tela:

  * Exibir ícone de cadeado
  * Texto explicando que precisa de login para usar
  * Botão "Entrar" / "Criar conta" abrindo o modal de login
  * **Nunca esconder a funcionalidade** — mostrar o valor antes de exigir login

  ### Regra

  A lógica de permissão deve estar centralizada em `web/routes/`. Nunca colocar lógica de permissão dentro de páginas ou componentes.

  **Exemplo de Implementação (`web/routes/RotaProtegida.tsx`):**
  ```tsx
  import { useAuthStore } from '@/stores/useAuthStore';
  import { Navigate } from 'react-router-dom';

  export function RotaProtegida({ children }) {
    const { usuario } = useAuthStore();
    if (!usuario) return <Navigate to="/login" replace />;
    return children;
  }
  ```

  **Uso no Roteador (`web/App.tsx`):**
  ```tsx
  <Route path="/dashboard" element={
    <RotaProtegida>
      <DashboardPage />
    </RotaProtegida>
  } />
  ```
  
  ### Rate Limiting (Proteção contra Brute Force)
  
  O subflow já vem com o componente `symfony/rate-limiter` configurado. O firewall de login (`/api/auth/login`) possui **throttling nativo** (limite de 5 tentativas por minuto por IP/Username).
  
  Para proteger outros endpoints sensíveis, use o atributo `#[IsGranted]` ou injete o `RateLimiterFactory` nos seus services.

  ---

  ## 5) Backend

  ### 5.1 Entidade

  Criar em `src/Entity/{Categoria}/NomeDaEntidade.php`.

  **Checklist obrigatório:**

  - [ ] UUID como chave primária com `doctrine.uuid_generator`
  - [ ] Getters **sem** prefixo `get` (ex: `titulo()`, não `getTitulo()`)
  - [ ] Setters **com** prefixo `set` retornando `self`
  - [ ] Campos `criadoEm` e `atualizadoEm` com `#[ORM\PreUpdate]`
  - [ ] Relacionamento com `Usuario` via `ManyToOne` + `OneToMany` na entidade `Usuario`
  - [ ] Método estático `fromDTO` para criação da entidade a partir de um DTO
  - [ ] Campos com conjunto fixo de valores usam **Enum** (`src/Enum/`) — nunca string/int hardcoded

  Padrão UUID:

  ```php
  #[ORM\Id]
  #[ORM\Column(type: 'uuid', unique: true)]
  #[ORM\GeneratedValue(strategy: 'CUSTOM')]
  #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
  private ?Uuid $uuid = null;
  ```

  Padrão `fromDTO`:

  ```php
  public static function fromDTO(CriarNomeDaEntidadeDTO $dto): self
  {
      return (new self())
          ->setTitulo($dto->titulo())
          ->setConteudo($dto->conteudo());
  }
  ```

  **Entidades com comportamento (não anêmicas)**

  Entidades não devem apenas transportar dados. Coloque regras de negócio dentro da entidade quando elas fazem sentido lá — especialmente invariantes e transições de estado:

  ```php
  // ❌ Anêmico: regra de negócio fora da entidade
  class CancelarPedidoService {
      public function executar(Pedido $pedido): void {
          if ($pedido->status() !== 'ativo') {
              throw new DomainException('Pedido não pode ser cancelado.');
          }
          $pedido->setStatus('cancelado');
      }
  }

  // ✅ Com comportamento: regra dentro da entidade
  class Pedido {
      public function cancelar(): void {
          if ($this->status !== 'ativo') {
              throw new DomainException('Pedido não pode ser cancelado.');
          }
          $this->status = 'cancelado';
      }
  }
  // No Service: $pedido->cancelar();
  ```

  **Proteção de invariantes nos setters**

  Setters que recebem valores inválidos **devem lançar exceção** — nunca aceitar silenciosamente:

  ```php
  public function setTitulo(string $titulo): self
  {
      if (trim($titulo) === '') {
          throw new \InvalidArgumentException('Título não pode ser vazio.');
      }
      $this->titulo = $titulo;
      return $this;
  }
  ```

  Isso garante que a entidade nunca entra em estado inconsistente, mesmo quando usada em testes, seeds ou scripts avulsos — não apenas no fluxo do Controller.

  ---

  ### 5.1.1 Value Objects

  Em vez de tipos primitivos soltos (`string $email`, `float $preco`), encapsule campos com validação e comportamento próprios em objetos imutáveis:

  ```php
  final class Email
  {
      private readonly string $valor;

      public function __construct(string $valor)
      {
          if (!filter_var($valor, FILTER_VALIDATE_EMAIL)) {
              throw new \InvalidArgumentException("E-mail inválido: {$valor}");
          }
          $this->valor = strtolower(trim($valor));
      }

      public function valor(): string { return $this->valor; }
      public function equals(self $outro): bool { return $this->valor === $outro->valor; }
  }
  ```

  Value Objects são **imutáveis** e **sem identidade própria** — dois com o mesmo valor são intercambiáveis. Use para: e-mails, CPFs, valores monetários, intervalos de datas, coordenadas. Benefício chave: `Dinheiro::somar()` nunca aceita somar BRL com USD acidentalmente — a regra está no objeto.

  ---

  ### 5.1.2 Aggregate Root

  Quando duas entidades só fazem sentido juntas (ex: `Pedido` e `ItemPedido`), o `Pedido` é o **Aggregate Root** — tudo que afeta o pedido passa por ele:

  ```php
  // ❌ Errado: manipulando entidade filha diretamente
  $item = new ItemPedido($produto, 2);
  $itemRepository->salvar($item);

  // ✅ Correto: tudo passa pelo Aggregate Root
  $pedido->adicionarItem($produto, 2);
  $pedidoRepository->salvar($pedido); // persiste pedido e itens juntos
  ```

  **Regra:** o Aggregate Root define o limite de consistência. Nunca persista entidades internas pelo Repository diretamente — sempre pelo root.

  ---

  ### 5.1.3 Specification Pattern

  Regras de negócio reutilizáveis e combináveis. Em vez de `if (campo > X && outro === Y && ...)` espalhado em vários services:

  ```php
  final class RecursoAptoParaProcessamentoSpecification
  {
      public function isSatisfiedBy(Recurso $recurso): bool
      {
          return $recurso->ativo()
              && $recurso->camposObrigatoriosPreenchidos()
              && !$recurso->emProcessamento();
      }
  }

  // No Service — legível e testável isoladamente:
  if (!$spec->isSatisfiedBy($recurso)) {
      throw new DomainException('Recurso não apto para processamento.');
  }
  ```

  Use quando a mesma regra aparece em mais de um lugar, ou quando a combinação de condições é complexa.

  ---

  ### 5.1.4 Enums para Valores Fixos

  Qualquer campo que aceite um conjunto fechado e previsível de valores **deve ser um Enum PHP** — nunca uma string ou inteiro solto no código.

  Criar em `src/Enum/NomeDoCampoEnum.php`:

  ```php
  enum Sexo: string
  {
      case Masculino = 'masculino';
      case Feminino  = 'feminino';
  }

  enum StatusPedido: string
  {
      case Pendente  = 'pendente';
      case Aprovado  = 'aprovado';
      case Cancelado = 'cancelado';
  }
  ```

  **Na entidade**, tipar a propriedade com o Enum e mapear via Doctrine:

  ```php
  // ❌ Proibido — string solta sem garantia de valores válidos
  #[ORM\Column(type: 'string')]
  private string $sexo;

  // ✅ Correto — Enum garante que apenas valores válidos entram
  #[ORM\Column(type: 'string', enumType: Sexo::class)]
  private Sexo $sexo;
  ```

  **No DTO**, tipar o campo com o Enum diretamente. O `#[MapRequestPayload]` do Symfony já converte o valor da requisição para o Enum automaticamente:

  ```php
  final readonly class CriarPedidoDTO
  {
      public function __construct(
          // ❌ Proibido
          // #[Assert\Choice(['pendente', 'aprovado', 'cancelado'])]
          // public string $status,

          // ✅ Correto
          public StatusPedido $status,
      ) {}

      public function status(): StatusPedido { return $this->status; }
  }
  ```

  **Regra:** se você está escrevendo `#[Assert\Choice(['a', 'b', 'c'])]` numa propriedade, é sinal de que ela deveria ser um Enum.

  Exemplos de campos que **obrigatoriamente** viram Enum:
  - Sexo / Gênero
  - Status (pedido, pagamento, envio, usuário)
  - Tipo (conta, documento, endereço)
  - Prioridade (baixa, média, alta)
  - Papel/Role (quando não gerenciado pelo Symfony Security)

  ---

  ### 5.2 Migration

  ```bash
  php bin/console doctrine:migrations:diff
  php bin/console doctrine:migrations:migrate
  ```

  Sempre revisar o SQL gerado antes de migrar.

  ---

  ### 5.3 Repository

  Criar em `src/Repository/{Categoria}/NomeDaEntidadeRepository.php`.

  Métodos típicos:

  * `buscarPorUsuario(Usuario $usuario): array`
  * `buscarPorUuidEUsuario(string $uuid, Usuario $usuario): ?NomeDaEntidade`
  * `salvar(NomeDaEntidade $entidade, bool $flush = false): void`
  * `remover(NomeDaEntidade $entidade, bool $flush = false): void`

  **Regras:**

  * **Toda** a lógica de acesso a banco e persistência deve estar no Repository.
  * **PROIBIDO**: Usar `EntityManagerInterface` diretamente nos Services. Sempre use os métodos do Repository.

  > ⚠️ **UUID no Doctrine:** Sempre converter string para objeto antes de usar em queries:
  >
  > ```php
  > ->setParameter('uuid', Uuid::fromString($uuid), 'uuid')
  > ```

  ---

  ### 5.4 DTOs

  Criar em `src/DataObject/{Categoria}/NomeDaOperacaoDTO.php`.

  **Nome obrigatório:** sufixo `DTO` (ex: `CriarRecursoDTO`, `AtualizarRecursoDTO`).

  **Checklist:**

  - [ ] `final readonly class`
  - [ ] Validações com `#[Assert\*]` em todas as propriedades
  - [ ] Sem setters
  - [ ] Getters sem prefixo `get`
  - [ ] Campos com conjunto fixo de valores tipados com **Enum** — nunca `string` com `#[Assert\Choice]`

  Exemplo:

  ```php
  final readonly class CriarNomeDaEntidadeDTO
  {
      public function __construct(
          #[Assert\NotBlank(message: 'O título é obrigatório.')]
          #[Assert\Length(min: 3, max: 255)]
          public string $titulo,
      ) {}

      public function titulo(): string
      {
          return $this->titulo;
      }
  }
  ```

  ---

  ### 5.5 Services

  Criar em `src/Service/{Funcionalidade}/NomeDaOperacaoService.php`.

  **Padrão de nome obrigatório: Verbo + Entidade + Service**

  Exemplos:

  * `CriarRecursoService.php`
  * `AtualizarRecursoService.php`
  * `DeletarRecursoService.php`
  * `ListarRecursoService.php`
  * `BuscarRecursoService.php`

  Organize os services em subpastas por domínio funcional (ex: `Usuario/`, `Admin/`, `Util/`, etc.).

  **Regras:**

  * Toda lógica de negócio, validação complexa, acesso a banco e integração com terceiros **DEVE** estar em um Service.
  * **PROIBIDO**: Usar `EntityManagerInterface` diretamente. Sempre use o Repository.
  * Nunca use `Request` ou `Response` dentro de um Service.
  * Use `DomainException` para erros de regra de negócio que o Controller deve capturar.

  **Checklist:**

  - [ ] `final class`
  - [ ] Dependências injetadas pelo construtor
  - [ ] Método principal `executar()`
  - [ ] Zero lógica de HTTP (sem Request/Response)

  > 💡 Para operações onde o "erro" é um caso previsto de negócio (ex: recurso duplicado, estado inválido para transição), prefira **Result Object** em vez de `DomainException`. Veja seção 5.9.

  ---

  ### 5.6 Serializer

  Criar em `src/Serializer/NomeDaEntidadeSerializer.php`.

  **Quando usar (REGRA DE OURO):**
  O uso de Serializer é **OBRIGATÓRIO** para todo retorno de dados da API. 

  ❌ **PROIBIDO**: Retornar objetos do Doctrine diretamente ou montar arrays `['id' => $e->id(), ...]` dentro do Controller "para economizar tempo".

  ✅ **MOTIVO**: O Serializer é o seu **Contrato de API**. Ele protege o frontend contra mudanças estruturais no banco de dados e garante que tipos complexos (Datas, Enums, UUIDs) sejam transformados em strings amigáveis para o JavaScript de forma consistente.

  Regras de implementação:

  ```php
  final class NomeDaEntidadeSerializer
  {
      public static function serializar(NomeDaEntidade $entidade): array
      {
          return [
              'uuid'         => $entidade->uuid()?->toRfc4122(),
              'titulo'       => $entidade->titulo(),
              'criadoEm'     => $entidade->criadoEm()->format('Y-m-d H:i:s'),
              'atualizadoEm' => $entidade->atualizadoEm()->format('Y-m-d H:i:s'),
          ];
      }
  }
  ```

  ---

  ### 5.7 Controller

  Criar em `src/Controller/{Categoria}/NomeDaEntidadeController.php`.

  A subpasta de categoria é **obrigatória** — organize por domínio funcional (ex: `Admin/`, `Auth/`, `Geral/`, etc.).

  **Checklist:**

  - [ ] Prefixo de rota: `#[Route('/api/v1/nome-da-entidade')]`
  - [ ] `#[IsGranted('ROLE_USER')]` nas rotas protegidas
  - [ ] `#[MapRequestPayload]` para mapear DTOs
  - [ ] Extends `DefaultController`; retornar sempre `Response` via `$this->success()` / `$this->error()` (`{ success, data }` / `{ success, error }`)
  - [ ] Lançar `\DomainException($codigo, $codigoHTTP)` no Service e deixar o **`KernelExceptionListener`** logar e formatar a resposta.
  - [ ] `\Exception` → `HTTP_INTERNAL_SERVER_ERROR`
  - [ ] **Lógica Zero**: apenas recebe Request, chama Service, retorna Response
  - [ ] Resolver usuário autenticado via `ResolverUsuarioPorTokenService`

  **O `KernelExceptionListener` já vem implementado no Subflow** para interceptar as exceções e mapear em JSON padronizado.

  **Convenção obrigatória: DomainException → HTTP status**

  | Situação de negócio | Status | Uso típico |
  | :--- | :---: | :--- |
  | Dados inválidos / regra violada | `400` | Campo fora do formato esperado, valor inválido |
  | Entidade não encontrada | `404` | UUID inexistente ou não pertence ao usuário |
  | Conflito / já existe | `409` | Recurso duplicado (ex: e-mail já cadastrado) |
  | Usuário não autenticado | `401` | Token ausente ou inválido |
  | Sem permissão | `403` | Usuário autenticado, mas sem acesso à ação |
  | Semanticamente inprocessável | `422` | Dados válidos sintaticamente, mas impossíveis de processar |
  
  ---
  
  ### 5.7.1 Padrão de Paginação no Backend
  
  Para listagens paginadas que atendem ao padrão `RespostaPaginada<T>` do frontend, o backend deve seguir esta estrutura:
  
  **No Repository:**
  ```php
  public function buscarPaginado(int $pagina, int $porPagina, array $filtros): array
  {
      $qb = $this->createQueryBuilder('e')
          ->setFirstResult(($pagina - 1) * $porPagina)
          ->setMaxResults($porPagina);
      
      // Aplicar filtros...
      
      $query = $qb->getQuery();
      $paginator = new \Doctrine\ORM\Tools\Pagination\Paginator($query);
      
      return [
          'itens' => iterator_to_array($paginator->getIterator()),
          'total' => count($paginator),
      ];
  }
  ```
  
  **No Service (`ListarEntidadeService`):**
  ```php
  public function executar(int $pagina, int $porPagina, array $filtros): array
  {
      $resultado = $this->repository->buscarPaginado($pagina, $porPagina, $filtros);
      
      return [
          'dados'     => array_map(fn($e) => Serializer::serializar($e), $resultado['itens']),
          'total'     => $resultado['total'],
          'pagina'    => $pagina,
          'porPagina' => $porPagina,
      ];
  }
  ```
  
  **No Controller:**
  ```php
  #[Route('', methods: ['GET'])]
  public function listar(Request $request): Response
  {
      $dados = $this->listarService->executar(
          $request->query->getInt('pagina', 1),
          20,
          $request->query->all('filtros')
      );

      return $this->paginated($dados['dados'], $dados['total'], $dados['pagina'], $dados['porPagina']);
  }
  ```

  ---

  ### 5.8 Message Handlers (Assíncrono)

  Os handlers do Messenger seguem a mesma disciplina dos Controllers: **Lógica Zero**.

  **Checklist:**

  - [ ] Nome terminado em `MessageHandler`
  - [ ] Atributo `#[AsMessageHandler]`
  - [ ] Apenas extrai dados da Message, busca entidades e delega ao Service
  - [ ] Tratamento de exceções ocorre dentro do Service

  ---

  ### 5.9 Envelope HTTP (`DefaultController`)

  Todo controller de API extends `DefaultController` e devolve `Response`. Chaves JSON em inglês.

  | Método | HTTP | JSON |
  | :--- | :--- | :--- |
  | `$this->success($data)` | 200 | `{ success: true, data }` |
  | `$this->created($data)` | 201 | `{ success: true, data }` |
  | `$this->noContent()` | 204 | vazio |
  | `$this->error('codigo', $status, $details?)` | 4xx | `{ success: false, error, details? }` |

  ```php
  public function criar(#[MapRequestPayload] CriarUsuarioDTO $dto): Response
  {
      $usuario = $this->criarUsuarioService->executar($dto);

      return $this->created($this->serializer->serializar($usuario));
  }
  ```

  Service devolve o dado. Erro previsto: `throw new \DomainException('email_duplicado', 409)`. O `KernelExceptionListener` responde no mesmo envelope.

  ---

  ### 5.10 Domain Events

  Eventos de domínio desacoplam o que acontece quando uma entidade muda de estado. O fato vai em `src/EventListener/Event/`; quem reage fica em `src/EventListener/` (mesmo contexto). O Service que cria um usuário não precisa saber que existe um sistema de e-mail — ele dispara um evento e cada listener reage de forma independente:

  ```php
  // 1. Definir o evento
  final class UsuarioCriadoEvent
  {
      public function __construct(
          public readonly string $usuarioUuid,
          public readonly string $email,
      ) {}
  }

  // 2. Service disparando o evento
  $this->eventDispatcher->dispatch(new UsuarioCriadoEvent(
      $usuario->uuid()->toRfc4122(),
      $usuario->email(),
  ));

  // 3. Listener independente — sem acoplamento com o Service de criação
  #[AsEventListener]
  final class EnviarEmailBoasVindasListener
  {
      public function __invoke(UsuarioCriadoEvent $event): void
      {
          $this->mailer->enviarBoasVindas($event->email);
      }
  }
  ```

  **Convenção de nome:** `{Entidade}{VerboPastTense}Event` — ex: `PedidoCanceladoEvent`, `PagamentoConfirmadoEvent`, `UsuarioAtivadoEvent`.

  **Regra:** Services não chamam outros Services para efeitos colaterais. Se a ação A causa B, use um evento. Isso evita a teia de `ServiceA → ServiceB → ServiceC` que torna o sistema frágil e difícil de testar.

  ---

  ### 5.11 Outbox Pattern

  **Problema:** você salva a entidade no banco e depois despacha um evento async ao Messenger. Se o processo cair entre os dois pontos, o evento é perdido silenciosamente.

  **Solução:** salvar o evento na mesma transação do banco, e um worker separado publica os eventos persistidos:

  ```
  [Service]
    → flush(entidade + evento na tabela outbox_events)  ← mesma transação
                                                               ↓
                               [Worker Outbox] → publica no Messenger → deleta da outbox
  ```

  Use quando o Messenger for crítico para o negócio (pagamentos, notificações obrigatórias, integrações externas). Para fluxos não-críticos, o dispatch direto é aceitável.
  
  **Exemplo de Implementação:**
  
  1. **Tabela `eventos_outbox` (Migration)**:
  ```sql
  CREATE TABLE eventos_outbox (
      uuid BINARY(16) NOT NULL PRIMARY KEY,
      nome_evento VARCHAR(255) NOT NULL,
      payload JSON NOT NULL,
      status VARCHAR(20) DEFAULT 'pendente', -- pendente, processado, falha
      criado_em DATETIME NOT NULL,
      index(status, criado_em)
  );
  ```
  
  2. **No Service (Transaction)**:
  ```php
  $this->entityManager->wrapInTransaction(function() use ($entidade, $evento) {
      $this->repository->salvar($entidade);
      $this->outboxRepository->adicionar(new EventoOutbox(
          nome: 'pedido.criado',
          payload: ['uuid' => $entidade->uuid()]
      ));
  });
  ```
  3. **No Worker / Command**:
  ```php
  // cli/symfony app:process-outbox
  $eventos = $this->outboxRepository->buscarPendentes();
  foreach ($eventos as $evento) {
      $this->bus->dispatch(new DynamicMessage($evento->nome(), $evento->payload()));
      $evento->marcarComoProcessado();
      $this->entityManager->flush();
  }
  ```

  ---

  ### 5.12 Domain Service vs Application Service

  O guia usa "Service" para tudo, mas há dois tipos distintos com responsabilidades diferentes. Confundi-los gera acoplamentos errados.

  **Application Service** — orquestra o caso de uso. Acessa repositórios, chama serviços externos, despacha eventos. Tem dependências de infraestrutura (banco, HTTP, fila):

  ```php
  // CriarAnimalService é um Application Service:
  // precisa verificar CPF do proprietário numa API externa e depois salvar no banco.
  final class CriarAnimalService
  {
      public function __construct(
          private readonly AnimalRepository $repository,
          private readonly CpfValidadorClient $cpfClient, // dependência de infraestrutura
          private readonly EventDispatcherInterface $events,
      ) {}

      public function executar(CriarAnimalDTO $dto): Animal
      {
          if (!$this->cpfClient->valido($dto->cpfProprietario())) {
              throw new \DomainException('cpf_invalido', 422);
          }
          $animal = Animal::fromDTO($dto);
          $this->repository->salvar($animal, flush: true);
          $this->events->dispatch(new AnimalCriadoEvent($animal->uuid()->toRfc4122()));

          return $animal;
      }
  }
  ```

  **Domain Service** — lógica de domínio pura que envolve múltiplas entidades mas não pertence a nenhuma delas. Sem dependências de infraestrutura. Testável sem banco ou HTTP:

  ```php
  // CalcularTaxaTransferenciaService é um Domain Service:
  // usa apenas entidades do domínio — sem I/O, sem banco, sem HTTP.
  final class CalcularTaxaTransferenciaService
  {
      public function calcular(Animal $animal, Rebanho $destino): Dinheiro
      {
          if ($destino->estadoFiscal() === $animal->rebanhoAtual()->estadoFiscal()) {
              return Dinheiro::zero();
          }
          return $animal->valorMercado()->percentual(2.5);
      }
  }
  ```

  **Regra prática:**

  | Pergunta | Resposta |
  | :--- | :--- |
  | Precisa de banco, HTTP, fila ou e-mail? | Application Service em `src/Service/{Funcionalidade}/` |
  | Pura lógica entre entidades, sem I/O? | Domain Service em `src/Domain/{Funcionalidade}/` |
  | Pode ser testado sem nenhum mock de infraestrutura? | Domain Service |
  | Lógica grande, repetida ou várias peças? | Vários services + interface + `TaggedIterator` em `src/Feature/` |

  ### 5.13 Feature

  **Não** coloque a lógica grande num único `*Service.php`. Sempre que possível, parta em vários services com a mesma interface e uma Feature com `#[TaggedIterator]`. A Feature só itera e devolve o dado. Query continua no Repository. Nova peça = nova classe, Feature não muda. Padrão e exemplo: [PARA-IA.md](PARA-IA.md) § 4.7.

  ---

  ### 5.14 Tarefas Agendadas (Scheduler)
  
  O Symfony Scheduler (`symfony/scheduler`) já vem configurado de forma nativa para gerenciar execuções recorrentes.
  
  Em vez de criar CRONs engessados no nível do sistema operacional, delegue a responsabilidade diretamente ao código através da classe `App\Schedule\AgendadorPrincipal`, que utiliza workers nativos do Messenger para disparar eventos regulares (mensais, diários, a cada X segundos).

  **Exemplo:**
  ```php
  public function getSchedule(): Schedule
  {
      return (new Schedule())
          ->add(RecurringMessage::every('1 day', new LimparTokensMessage()))
          ->add(RecurringMessage::cron('0 8 * * *', new EnviarResumoMessage()));
  }
  ```

  ---

  ### Estrutura de pastas esperada (Backend)

  ```text
  src/
    Command/                    ← comandos CLI (Symfony Console)
    Controller/
      {Categoria}/              ← obrigatório: Admin/, Auth/, Geral/, etc.
    DataObject/                 ← DTOs (CriarXxxDTO, AtualizarXxxDTO)
      {Categoria}/              ← organizar por Categoria funcional
    Domain/
      {Funcionalidade}/         ← Domain Services (lógica pura, sem I/O)
    Entity/                     ← Entidades e Aggregate Roots
      {Categoria}/             ← organizar por Categoria funcional
    Enum/                       ← Enums de domínio (Sexo, StatusPedido, TipoConta…)
    EventListener/
      Event/                    ← Domain Events (XxxCriadoEvent, XxxCanceladoEvent)
                                ← Listeners (#[AsEventListener]) ao lado
    Feature/                    ← *Feature.php + TaggedIterator; lógica grande em vários services
    Interface/                  ← contratos PHP (*Interface.php)
    Message/                    ← Mensagens para o Messenger
    MessageHandler/             ← Handlers (#[AsMessageHandler])
    Repository/                 ← Repositórios (um por entidade)
     {Categoria}/              ← organizar por Categoria funcional
    Serializer/                 ← Serializadores de resposta
    Service/
      {Funcionalidade}/         ← Application Services (CriarXxxService, etc.)
    Specification/              ← Specification Pattern
    ValueObject/                ← Value Objects (Email, Dinheiro, Cpf)
    Kernel.php
  ```

  ---

  ## 6) Frontend

  ### 6.1 Estrutura de pastas

  ```text
  web/
    App.tsx
    main.tsx
    index.css
    vite-env.d.ts

    assets/                 ← imagens, fontes, SVGs estáticos
    config/                 ← instância axios, constantes globais
    contexts/               ← Context API (tema, I18n — não estado de UI)
    layouts/                ← sidebar, header, wrappers de página
    routes/                 ← proteção de rotas (nunca dentro da página)
    shared/ui/layout.tsx    ← primitivos de layout/texto (Box, VStack, Text…)
    stores/                 ← Zustand stores (useAuthStore, etc.)

    features/               ← módulos com feature própria
      {feature}/
        types.ts            ← tipos exclusivos desta feature
        api.ts              ← chamadas HTTP desta feature
        hooks/              ← hooks desta feature
        components/         ← componentes desta feature
        pages/              ← páginas desta feature

    shared/                 ← tudo que é global e sem feature
      components/
        page/
          {NomeDaPagina}/   ← componentes de página que não viraram feature
        responsive/         ← padrões Dialog/Drawer, tabelas responsivas
        formulario/         ← campos, selects reutilizáveis
        tabela/             ← tabela padrão, paginação
      hooks/                ← useDebounce, usePaginacao, useSEO
      types/
        api.ts              ← RespostaApi<T>, RespostaPaginada<T>
        index.ts            ← interfaces globais (Usuario, Paginacao…)
      utils/                ← helpers puros (formatarData, formatarMoeda)

    pages/                  ← páginas simples que não justificam uma feature
      {NomeDaPagina}/
        {NomeDaPagina}.tsx
  ```

  > ⚠️ **Ambiguidade resolvida:** a estrutura anterior tinha `hooks/`, `types/`, `utils/` e `components/` na raiz **e** dentro de `shared/` ao mesmo tempo — dois lugares para a mesma coisa, sem regra de qual usar. Agora `shared/` absorve tudo que é global. Não existe mais `hooks/`, `types/`, `utils/` ou `components/` soltos na raiz de `web/`.

  **Regra de decisão — onde colocar um arquivo novo:**

  ```text
  Tem mais de 2 arquivos relacionados (types + hooks + components)?
    └── Sim → features/{feature}/
    └── Não → É reutilizável em múltiplas páginas?
                └── Sim → shared/{components|hooks|utils|types}/
                └── Não → É uma página isolada simples?
                            └── Sim → pages/{NomeDaPagina}/
  ```

  Vantagem: ao deletar uma feature, você deleta uma pasta inteira — sem caçar arquivos espalhados. E a pergunta "onde coloco isso?" tem uma resposta única.

  ---

  ### 6.2 Types (TypeScript)

  | Tipo | Onde criar |
  | :--- | :--- |
  | Exclusivo de uma feature | `web/features/{feature}/types.ts` |
  | Reutilizado por múltiplas features | `web/shared/types/index.ts` |
  | Envelope de resposta da API | `web/shared/types/api.ts` |

  **Checklist:**

  - [ ] Interface por entidade (não usar `class`)
  - [ ] Propriedades em português, nomes idênticos ao retorno do backend
  - [ ] Tipos de feature nunca importados de `shared/` por engano — e vice-versa

  ```typescript
  // web/features/animais/types.ts — exclusivo da feature
  export interface Animal {
    uuid: string;
    nome: string;
    especie: string;
    criadoEm: string;
  }
  ```

  **Tipos de envelope de API (obrigatório em `shared/types/api.ts`):**

  Todo endpoint retorna a mesma estrutura. Defina uma vez e referencie em todos os hooks:

  ```typescript
  // web/shared/types/api.ts
  export interface RespostaApi<T> {
    success: boolean
    data: T
  }

  export interface RespostaPaginada<T> {
    success: boolean
    data: T[]
    total: number
    pagina: number
    porPagina: number
  }
  ```

  Nos hooks, use `RespostaApi<Animal>` em vez de redefinir a estrutura toda vez.

  ---

  ### 6.3 Chamadas HTTP por feature (`api.ts`)

  > ⚠️ **Ambiguidade resolvida:** a estrutura anterior tinha uma pasta `services/` global. Na nova organização não existe `web/services/` — as chamadas HTTP ficam em `features/{feature}/api.ts` junto com os tipos e hooks da mesma feature.

  Criar em `web/features/{feature}/api.ts`:

  ```typescript
  // web/features/animais/api.ts
  import { api } from '@/config/api'
  import type { RespostaApi, RespostaPaginada } from '@/shared/types/api'
  import type { Animal } from './types'

  export const animaisApi = {
    listar: (filtros: FiltrosAnimais) =>
      api.get<RespostaPaginada<Animal>>('/api/v1/animais', { params: filtros }),
    criar: (dados: CriarAnimalPayload) =>
      api.post<RespostaApi<Animal>>('/api/v1/animais', dados),
    remover: (uuid: string) =>
      api.delete(`/api/v1/animais/${uuid}`),
  }
  ```

  **Checklist:**

  - [ ] Apenas arquivos `.ts` (sem JSX)
  - [ ] Usar somente a `axiosInstance` de `config/api.ts` — nunca Axios direto
  - [ ] Tipado com `RespostaApi<T>` ou `RespostaPaginada<T>` de `shared/types/api.ts`

  ---

  ### 6.4 Hooks

  **Onde criar:**
  * Se for exclusivo de uma funcionalidade: `web/features/{feature}/hooks/`
  * Se for reutilizável e global: `web/shared/hooks/`

  NÃO criar na raiz `web/hooks/`.

  Exemplos de nomes:
  * `useCriarNomeDaEntidade.ts`
  * `useAtualizarNomeDaEntidade.ts`

  **Regra obrigatória de feedback visual (toast):**

  A responsabilidade pelo `toast.success()` e `toast.error()` é do **hook**, nunca do componente.

  * Hooks **não aceitam** callbacks `onSuccess` ou `onError` como parâmetros.
  * O componente apenas chama o hook e consome o estado retornado.

  ✅ Correto:

  ```typescript
  export function useCriarNomeDaEntidade() {
    const [carregando, setCarregando] = useState(false);

    async function criar(dados: CriarNomeDaEntidadePayload) {
      setCarregando(true);
      try {
        await api.post('/api/v1/nome-da-entidade', dados);
        toast.success('Criado com sucesso.');
      } catch {
        toast.error('Erro ao criar. Tente novamente.');
      } finally {
        setCarregando(false);
      }
    }

    return { criar, carregando };
  }
  ```

  ❌ Proibido — componente controlando feedback visual:

  ```typescript
  const { criar } = useCriarNomeDaEntidade({
    onSuccess: () => toast.success('Criado!'),
    onError: () => toast.error('Erro!'),
  });
  ```

  **Checklist:**

  - [ ] Um hook por operação
  - [ ] `toast.success()` e `toast.error()` dentro do hook, nunca no componente
  - [ ] Hook não recebe parâmetros `onSuccess` / `onError`
  - [ ] Consumir apenas a `axiosInstance` de `api.ts`
  - [ ] Retornar estado de carregamento (`carregando: boolean`)

  **React Query / TanStack Query (recomendado para dados de servidor)**

  **Quando usar:**
  * **TanStack Query (`useQuery`)**: Para **todos** os dados que vêm da API, precisam de cache, compartilhamento entre componentes ou revalidação automática.
  * **TanStack Query (`useMutation`)**: Para ações de escrita (POST/PUT/DELETE) que precisam invalidar caches existentes ou disparar feedbacks globais.
  * **`useState` local**: Apenas para estado de UI efêmero (abrir modal, tab ativa, hover).
  * **React Hook Form**: Para gerenciar o estado interno de inputs e validação de formulários.

  O padrão `useState + useEffect + axios` reinventa cache, revalidação e deduplication manualmente. Para dados que vem da API, prefira **TanStack Query**:

  ```typescript
  // ✅ Com TanStack Query: cache, deduplication e revalidação automáticos
  export function useBuscarRecursos(filtros: FiltrosRecursos) {
    return useQuery({
      queryKey: ['recursos', filtros],
      queryFn: () => api.get('/api/v1/recursos', { params: filtros }).then(r => r.data.dados),
      staleTime: 1000 * 30, // 30s antes de revalidar
    });
  }

  // Mutações com invalidação de cache automática
  export function useCriarRecurso() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (dados: CriarRecursoPayload) =>
        api.post('/api/v1/recursos', dados).then(r => r.data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['recursos'] });
        toast.success('Criado com sucesso.');
      },
      onError: () => toast.error('Erro ao criar. Tente novamente.'),
    });
  }
  ```

  **Optimistic Updates**

  Para ações onde atualizar a UI antes da confirmação do servidor melhora a UX (deletar item, marcar como lido, reordenar), use `onMutate`:

  ```typescript
  export function useDeletarRecurso() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (uuid: string) => api.delete(`/api/v1/recursos/${uuid}`),
      onMutate: async (uuid) => {
        await queryClient.cancelQueries({ queryKey: ['recursos'] });
        const anterior = queryClient.getQueryData<Recurso[]>(['recursos']);
        queryClient.setQueryData<Recurso[]>(['recursos'], (old = []) =>
          old.filter(r => r.uuid !== uuid),
        );
        return { anterior }; // contexto para rollback em caso de erro
      },
      onError: (_, __, context) => {
        queryClient.setQueryData(['recursos'], context?.anterior);
        toast.error('Erro ao deletar. Tente novamente.');
      },
      onSuccess: () => toast.success('Deletado com sucesso.'),
    });
  }
  ```

  **Regra:** use optimistic update apenas quando o rollback for simples e o erro improvável. Não aplique para criação de recursos com campos gerados pelo backend (UUID, timestamps).

  Benefícios: `stale-while-revalidate`, deduplication de requests simultâneos, prefetch, optimistic updates e retry automático. A regra do toast no hook continua válida.

  ---

  ### 6.5 Componentes

  > ⚠️ **Ambiguidade resolvida:** a estrutura anterior tinha três lugares para componentes globais — `components/formulario/`, `components/tabela/` e `shared/components/` — sem regra clara de qual usar. Agora existe um único lugar: `shared/components/`. Não existe mais pasta `components/` na raiz de `web/`.

  #### Componentes de feature

  Componentes exclusivos de uma feature ficam dentro da própria feature:

  ```text
  web/features/animais/components/
    TabelaAnimais.tsx
    ModalCriarAnimal.tsx
    FiltrosAnimais.tsx
  ```

  #### Componentes de página sem feature

  Páginas simples (que não viraram feature) têm seus componentes em `shared/components/page/`:

  ```text
  web/shared/components/page/Dashboard/
    ResumoIndicadores.tsx
    GraficoAcessos.tsx
  ```

  #### Componentes globais reutilizáveis

  Componentes usados em múltiplas features ou páginas ficam em `shared/components/{contexto}/`:

  ```text
  web/shared/components/formulario/
    CampoTexto.tsx
    CampoSelect.tsx

  web/shared/components/tabela/
    TabelaPadrao.tsx
    PaginacaoTabela.tsx

  web/shared/components/responsive/
    DialogOuDrawer.tsx
  ```

  #### Nomenclatura

  ✅ Bom: `TabelaAnimais`, `ModalCriarAnimal`, `FiltroRelatorioConversao`

  ❌ Ruim: `Card1`, `Tabela`, `Modal`, `BoxInfo`, `ComponentX`

  **Checklist:**

  - [ ] Nenhum HTML puro (`div`, `span`, `p`, `h1`, `button`, etc.) — usar `shared/ui/layout` + HeroUI
  - [ ] Estilização via `className` + TailwindCSS
  - [ ] Animações com `tailwindcss-motion` nas transições de entrada

  ---

  ### 6.6 Responsividade

  Sempre verificar `web/shared/components/responsive/` antes de criar qualquer componente novo.

  Padrão obrigatório:

  * Desktop: layout horizontal / tabela completa
  * Mobile: layout empilhado / master-detail / bottom sheet
  * Dialog no desktop → Drawer no mobile para modais

  **Checklist:**

  - [ ] Componente responsivo criado quando necessário
  - [ ] Dialog (desktop) / Drawer (mobile) para todos os modais

  ---

  ### 6.7 Páginas

  Criar em `web/pages/{NomeDaPagina}/{NomeDaPagina}.tsx`.

  **Estrutura obrigatória de layout:**

  ```tsx
  import { useSEO } from '@/hooks/useSEO'

  export function Component() {
    useSEO({
      title: 'Título da Página — Nome do Sistema',
      description: 'Descrição clara da funcionalidade desta página (150–160 caracteres).',
      keywords: 'palavra-chave1, palavra-chave2, palavra-chave3',
    })

    return (
      <AppContainer>
        <Container>Seção 1</Container>
        <Container>Seção 2</Container>
      </AppContainer>
    );
  }
  ```

  * `AppContainer` é o container principal da página.
  * Cada `<Container>` representa uma seção.
  * Se uma seção ficar grande, extraia para um componente em `web/shared/components/page/{NomeDaPagina}/`.
  * `useSEO` deve ser a **primeira chamada** dentro de `Component()`, antes de qualquer `return`.

  **SEO — regras do hook `useSEO` (`web/shared/hooks/useSEO.ts`):**

  | Prop | Obrigatório | Descrição |
  | :--- | :---: | :--- |
  | `title` | ✅ | Título da página |
  | `description` | ✅ | Resumo da página com 150–160 caracteres |
  | `keywords` | ✅ | Palavras-chave separadas por vírgula (5–10 termos relevantes) |
  | `noindex` | — | `true` para páginas que não devem ser indexadas (ex: rotas autenticadas) |
  | `jsonLd` | — | Dado estruturado Schema.org para páginas com conteúdo rico |

  **Checklist:**

  - [ ] Exportação: `export function Component()`
  - [ ] `useSEO` configurado com `title`, `description` e `keywords` como primeira instrução
  - [ ] Rotas privadas/autenticadas com `noindex: true`
  - [ ] Hierarquia obrigatória: `AppContainer` → `Container` por seção
  - [ ] Zero comentários no código
  - [ ] Lógica movida para hooks ou services

  ---

  ### 6.8 Rotas

  Adicionar a rota em `web/App.tsx` e atualizar o mapa de rotas neste documento (seção 3).

  **Checklist:**

  - [ ] Rota **lazy-loaded**: `lazy={() => import('./pages/...')}`
  - [ ] Proteção definida em `web/routes/` — nunca dentro da página
  - [ ] Tipo de acesso definido (Pública / Parcialmente protegida / Totalmente protegida)
  - [ ] Se a rota for pública ou parcialmente protegida, URL adicionada ao `public/sitemap.xml` com `<lastmod>` e `<priority>` adequados

  ---

  ### 6.9 Estado Global (Zustand)

  O `Context` do React tem um problema estrutural: qualquer mudança no `value` do Provider re-renderiza **todos** os consumidores, mesmo os que não usam o campo alterado. Em apps com sidebar, notificações, filtros e usuário autenticado, isso vira problema real.

  Use **Zustand** para estado global compartilhado entre páginas ou componentes distantes:

  ```typescript
  // stores/useAuthStore.ts
  interface AuthStore {
    usuario: Usuario | null;
    token: string | null;
    setAutenticado: (usuario: Usuario, token: string) => void;
    limpar: () => void;
  }

  export const useAuthStore = create<AuthStore>((set) => ({
    usuario: null,
    token: null,
    setAutenticado: (usuario, token) => set({ usuario, token }),
    limpar: () => set({ usuario: null, token: null }),
  }));

  // Em qualquer componente — sem Provider, sem prop drilling:
  const { usuario } = useAuthStore();
  ```
  
  #### Integração com Autenticação (Fluxo Completo)
  
  O padrão de autenticação deve ser implementado via interceptors do Axios para garantir o envio automático do token e tratamento global de erros.
  
  **1. Store de Autenticação (`web/stores/useAuthStore.ts`):** 
  ```typescript
  import { create } from 'zustand'
  import { persist, createJSONStorage } from 'zustand/middleware'
  
  export const useAuthStore = create()(
    persist(
      (set) => ({
        usuario: null,
        token: null,
        setAutenticado: (usuario, token) => set({ usuario, token }),
        limpar: () => set({ usuario: null, token: null }),
      }),
      {
        name: 'auth-storage', 
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
  ```
  
  **2. Configuração do Axios Interceptor (`web/config/api.ts`):**
  ```typescript
  export const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });
  
  // Injeta o token em todas as requisições
  api.interceptors.request.use((config) => {
    const { token } = useAuthStore.getState();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  
  // Fila para lidar com requisições concorrentes durante o refresh
  let isRefreshing = false;
  let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];
  
  const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
      if (error) prom.reject(error);
      else prom.resolve(token!);
    });
    failedQueue = [];
  };
  
  // Trata 401 e renova o access_token sem perder a fila de requests originais
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return api(originalRequest);
          }).catch((err) => Promise.reject(err));
        }
        
        originalRequest._retry = true;
        isRefreshing = true;
        
        try {
          const { refreshToken } = useAuthStore.getState();
          const { data } = await axios.post('/api/token/refresh', { refresh_token: refreshToken });
          
          useAuthStore.getState().setAutenticado(null, data.token); // ou useAuthStore.getState().setToken(...)
          processQueue(null, data.token);
          
          originalRequest.headers.Authorization = 'Bearer ' + data.token;
          return api(originalRequest);
        } catch (err) {
          processQueue(err, null);
          useAuthStore.getState().limpar();
          window.location.href = '/login';
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }
      return Promise.reject(error);
    }
  );
  ```
  
  **Regra:** Hooks que fazem login (ex: `useLogin`) devem apenas invocar `setAutenticado()` do store no `onSuccess`, sem manipular tokens ou headers manualmente.

  **Regras:**

  * Um store por domínio — `useAuthStore`, `useNotificacoesStore`, `useFiltroPedidosStore`.
  * Stores ficam em `web/stores/`.
  * Context continua sendo usado para temas e I18n — casos onde o re-render em cascata é aceitável.
  * Migração é gradual: substitua um Context por vez.

  ---

  ### 6.10 Formulários (React Hook Form + Zod)

  Sem um padrão, cada formulário vira um `useState` por campo com validação manual. Use **React Hook Form** com **Zod** para validação tipada e performante:

  ```typescript
  import { z } from 'zod';
  import { useForm } from 'react-hook-form';
  import { zodResolver } from '@hookform/resolvers/zod';

  const schema = z.object({
    titulo: z.string().min(3, 'Título deve ter pelo menos 3 caracteres.'),
    peso: z.number({ invalid_type_error: 'Peso deve ser um número.' })
           .positive('Peso deve ser positivo.'),
  });

  type FormData = z.infer<typeof schema>;

  export function FormularioCriarRecurso() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } =
      useForm<FormData>({ resolver: zodResolver(schema) });

    async function onSubmit(dados: FormData) {
      await criarRecurso(dados);
    }

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input {...register('titulo')} />
        {errors.titulo && <Text>{errors.titulo.message}</Text>}
        <Button type="submit" disabled={isSubmitting}>Salvar</Button>
      </form>
    );
  }
  ```

  **Benefício adicional:** o schema Zod pode ser gerado a partir do OpenAPI do backend via `openapi-typescript` — mesma fonte de verdade para validação nos dois lados.

  ---

  ### 6.11 Error Boundaries

  Sem Error Boundary, um erro de runtime em qualquer componente derruba a **página inteira**. Envolva componentes que fazem fetch em boundaries isolados:

  ```tsx
  class ErrorBoundary extends React.Component<
    { fallback: ReactNode; children: ReactNode },
    { temErro: boolean }
  > {
    state = { temErro: false };
    static getDerivedStateFromError() { return { temErro: true }; }
    componentDidCatch(error: Error) { registrarErroNoServico(error); }
    render() {
      return this.state.temErro ? this.props.fallback : this.props.children;
    }
  }

  // Uso — a TabelaRecursos pode quebrar sem derrubar o restante da página:
  <ErrorBoundary fallback={<Text>Erro ao carregar os dados.</Text>}>
    <TabelaRecursos />
  </ErrorBoundary>
  ```

  **Regra:** qualquer componente que faz fetch de dado externo deve estar envolto por um `ErrorBoundary` com fallback adequado.

  ---

  ### 6.12 Loading States (Subflow)

  Use **Subflow loading** em vez de spinner central para conteúdo com forma conhecida. O Subflow substitui o contorno exato do que vai aparecer, eliminando layout shift:

  ```tsx
  // Regra: todo componente que faz fetch tem uma variante Subflow
  function TabelaRecursos() {
    const { data, isLoading } = useBuscarRecursos(filtros);
    if (isLoading) return <TabelaRecursosSubflow />;
    return <Tabela dados={data} />;
  }

  // Imita o layout exato da tabela
  function TabelaRecursosSubflow() {
    return (
      <VStack gap-2>
        {Array.from({ length: 5 }).map((_, i) => (
          <Box key={i} className="h-12 w-full rounded-lg bg-background-100 animate-pulse" />
        ))}
      </VStack>
    );
  }
  ```

  **Regra:** `Spinner` centralizado só para ações pontuais (salvar, deletar, upload). Para conteúdo listado ou estruturado, use sempre Subflow.

  ---

  ### 6.13 Estado de URL

  O estado da aplicação tem quatro tipos distintos, cada um com o lugar certo para viver:

  | Tipo de estado | Onde vive |
  | :--- | :--- |
  | Dados do servidor (lista, detalhe) | TanStack Query |
  | Estado global compartilhado (usuário autenticado, tema) | Zustand |
  | Estado local efêmero (modal aberto, tab ativa, hover) | `useState` |
  | **Filtros, paginação, busca** | **URL (`useSearchParams`)** |

  Filtros e paginação na URL tornam links compartilháveis, fazem o botão voltar funcionar e sobrevivem a um refresh:

  ```typescript
  import { useSearchParams } from 'react-router-dom'

  export function useFiltrosRecursos() {
    const [params, setParams] = useSearchParams()
    const pagina = Number(params.get('pagina') ?? 1)
    const busca = params.get('busca') ?? ''
    const status = params.get('status') ?? 'todos'

    function atualizarFiltros(novos: Partial<FiltrosRecursos>) {
      setParams(prev => {
        const next = new URLSearchParams(prev)
        Object.entries(novos).forEach(([k, v]) => {
          if (v) next.set(k, String(v))
          else next.delete(k)
        })
        next.set('pagina', '1') // reset paginação ao filtrar
        return next
      })
    }

    return { pagina, busca, status, atualizarFiltros }
  }
  ```

  **Regra:** se o usuário compartilhar o link, a outra pessoa deve ver exatamente o mesmo estado de filtro e paginação. Se o estado não deve sobreviver a um refresh da página, use `useState`.

  ---

  ### Estrutura de pastas esperada (Frontend)

  ```text
  web/
    App.tsx
    main.tsx
    index.css
    vite-env.d.ts

    assets/                     ← imagens, fontes, SVGs estáticos
    config/                     ← instância axios, constantes globais
    contexts/                   ← Context API (tema, I18n — não estado de UI)
    layouts/                    ← sidebar, header, wrappers de página
    routes/                     ← proteção de rotas (nunca dentro da página)
    shared/ui/layout.tsx        ← primitivos de layout/texto (Box, VStack, Text…)
    stores/                     ← Zustand stores (useAuthStore, etc.)

    features/                   ← módulos com feature própria (>2 arquivos relacionados)
      {feature}/
        types.ts                ← tipos exclusivos desta feature
        api.ts                  ← chamadas HTTP desta feature
        hooks/                  ← hooks desta feature
        components/             ← componentes desta feature
        pages/                  ← páginas desta feature

    shared/                     ← tudo que é global e sem feature
      components/
        page/
          {NomeDaPagina}/       ← componentes de páginas simples sem feature
        responsive/             ← padrões Dialog/Drawer, tabelas responsivas
        formulario/             ← campos, selects reutilizáveis
        tabela/                 ← tabela padrão, paginação
      hooks/                    ← useDebounce, usePaginacao, useSEO
      types/
        api.ts                  ← RespostaApi<T>, RespostaPaginada<T>
        index.ts                ← interfaces globais (Usuario, Paginacao…)
      utils/                    ← helpers puros (formatarData, formatarMoeda)

    pages/                      ← páginas simples que não justificam uma feature
      {NomeDaPagina}/
        {NomeDaPagina}.tsx
  ```

  ---

  ## 7) Regras de UI

  ### Proibido usar tags HTML padrão

  Não usar `div`, `span`, `p`, `h1`, `button`, etc. diretamente.

  ### Usar somente componentes do sistema

  Layout/texto sempre via `web/shared/ui/layout.tsx` (`Box`, `HStack`, `VStack`, `Flex`, `Grid`, `Container`, `Text`). Elementos interativos (botão, input, select, tabela, dialog, toast) sempre via **HeroUI** (`@heroui/react`), nunca HTML cru.

  ### Estilização obrigatória

  * Todo estilo via `className` + **TailwindCSS**.
  * O sistema deve sempre manter transições, animações e sensação moderna e fluida.

  ### Animações

  Padrão oficial: **tailwindcss-motion** (classes Tailwind, zero JS). Framer Motion (`AnimatePresence`) só via módulo opcional `ui-extra`, quando há montagem/desmontagem condicional real.

  * Aplicar animações em: entrada de seções, abertura de modais, carregamentos, troca de páginas.
  * Evitar telas "secas" sem transição. Não exagerar.

  ---

  ## 8) Lints e Qualidade

  ```bash
  # Verificação
  make lint-php
  make lint-tsx
  make lint-all

  # Correção automática
  make auto-fix-diff
  ```

  ---

  ## 9) Checklist de Pull Request

  Antes de abrir PR:

  - [ ] `make lint-all` passou sem erros
  - [ ] Nenhum HTML puro no frontend (`Box`/`VStack`/`Text` de `shared/ui/layout` + HeroUI)
  - [ ] Página segue padrão `AppContainer → Container`
  - [ ] Hooks consumindo `api.ts`
  - [ ] Toast gerenciado pelo hook, não pelo componente
  - [ ] Error Boundary envolvendo componentes que fazem fetch — ver seção 6.11
  - [ ] Subflow implementado para listas e conteúdo estruturado — ver seção 6.12
  - [ ] Helpers pequenos em `utils/`
  - [ ] Controllers e MessageHandlers sem regra de negócio (Lógica Zero)
  - [ ] DTO com validações e sem setters
  - [ ] Getters sem prefixo `get`
  - [ ] Entidade com UUID obrigatório e método `fromDTO`
  - [ ] Value Objects usados para campos com validação própria (email, CPF, dinheiro) — ver seção 5.1.1
  - [ ] Entidade com comportamento quando há transição de estado — ver seção 5.1
  - [ ] Specification criada quando a mesma regra aparece em mais de um lugar — ver seção 5.1.3
  - [ ] Domain Event disparado quando ação causa efeitos colaterais — ver seção 5.10
  - [ ] Services nomeados no padrão Verbo + Entidade + Service
  - [ ] Controller dentro da subpasta de categoria correta (`src/Controller/{Categoria}/`)
  - [ ] DomainException mapeada para o status HTTP correto (ver tabela na seção 5.7)
  - [ ] Visual agradável + transições + animações
  - [ ] `useSEO` configurado na página nova com `title`, `description` e `keywords`
  - [ ] Rotas privadas/autenticadas com `noindex: true` no `useSEO`
  - [ ] Novas rotas públicas adicionadas ao `public/sitemap.xml`
  - [ ] `README.md` atualizado com a nova funcionalidade

  ---

  ## 10) Seeders

  Para iniciar um projeto novo ou onboardar na máquina local, o comando **`app:seed`** popula dados de exemplo.

  ```bash
  docker compose exec backend bin/console app:seed
  ```

  O código está em `src/Command/AppSeedCommand.php`. Expanda esse script para garantir uma base rica em desenvolvimento.

  ---

  ## 11) Observabilidade

  Um sistema sem observabilidade torna debugging em produção uma caça às cegas.

  ### 11.1 Logging estruturado

  Em vez de mensagens de texto livre, emita logs como JSON estruturado com campos indexados:

  ```php
  // ❌ Difícil de agregar e filtrar
  $logger->info('Usuário criado com sucesso');

  // ✅ Cada campo é pesquisável no Loki, Datadog ou grep + jq
  $logger->info('usuario.criado', [
      'uuid'       => $usuario->uuid()->toRfc4122(),
      'email'      => $usuario->email(),
      'duracao_ms' => $this->timer->elapsed(),
  ]);
  ```

  O Monolog já vem **configurado por padrão no Subflow** (`config/packages/monolog.yaml` no bloco `when@prod`) para emitir JSON estruturado tanto pela aplicação Web (`nested`) quanto pelos comandos em segundo plano (`console`). Isso garante legibilidade imediata em agregadores como Datadog e Kibana, sem configuração extra.

  ### 11.2 Correlation ID

  Um UUID gerado no início de cada request, propagado por todos os logs daquele fluxo. Quando um erro ocorre em produção, filtre por `correlation_id` e veja toda a história do request — do Controller ao Repository ao Messenger handler:

  ```php
  // EventSubscriber injetando o Correlation ID nos logs:
  public function onKernelRequest(RequestEvent $event): void
  {
      $correlationId = $event->getRequest()->headers->get('X-Correlation-ID')
          ?? Uuid::v4()->toRfc4122();

      $event->getRequest()->attributes->set('correlation_id', $correlationId);

      $this->logger->pushProcessor(fn ($record) => array_merge(
          $record, ['extra' => ['correlation_id' => $correlationId]]
      ));
  }
  ```

  ### 11.3 Health Check endpoint (`/api/v1/health`)
  
  O roteiro `GET /api/v1/health` já vem implementado com verificações de serviços críticos. Docker, orquestradores e monitores externos usam esse endpoint para saber se o container está saudável.
  
  A implementação real em `App\Controller\HealthController` verifica:
  1.  **Conectividade com Banco de Dados**: Tenta uma conexão nativa para garantir que o MySQL está respondendo.
  2.  **Espaço em Disco**: Alerta se houver menos de 100MB livres para logs e cache.
  3.  **Versão da App**: Expõe a `APP_VERSION` definida no ambiente.

  ---

  ### 11.4 Rastreamento de erros em produção (Sentry)

  Sem um coletor de erros, exceptions não tratadas em produção viram silêncio. 
  
  O Subflow **já provê o pacote Sentry instalado nativamente** (`sentry/sentry-symfony` no PHP e `@sentry/react` no Frontend), contudo ele fica **desativado por padrão** para não exigir setup obrigatório ao iniciar projetos pequenos.
  
  **Para ativar o rastreamento global:**
  1. No seu `.env`, preencha a DSN do projeto preexistente: `SENTRY_DSN="http://..."`.
  2. No arquivo `config/packages/sentry.yaml`, remova os marcadores de comentário (`#`) das diretivas de produção.

  **Regra obrigatória no Error Boundary:** todo `componentDidCatch` **deve** reportar ao Sentry:

  ```tsx
  componentDidCatch(error: Error) {
    Sentry.captureException(error, {
      extra: { componente: this.constructor.name },
    });
  }
  ```

  Sem isso, erros de frontend silenciosos nunca chegam ao time. Configure alertas no Sentry para exceptions novas em produção — notificação imediata antes do usuário reportar.

  ---

  ## 12) Referências oficiais

  ### Backend

  * [Symfony 7.x](https://symfony.com/doc/current/index.html)
  * [Doctrine ORM](https://www.doctrine-project.org/projects/doctrine-orm/en/current/index.html)
  * [LexikJWTAuthenticationBundle](https://github.com/lexik/LexikJWTAuthenticationBundle)
  * [NelmioCorsBundle](https://github.com/nelmio/NelmioCorsBundle)
  * [Symfony Validator / Assert](https://symfony.com/doc/current/validation.html)

  ### Frontend

  * [React](https://react.dev/)
  * [Vite](https://vitejs.dev/)
  * [Axios](https://axios-http.com/)
  * [TanStack Query (React Query)](https://tanstack.com/query/latest)
  * [Zustand](https://zustand-demo.pmnd.rs/)
  * [React Hook Form](https://react-hook-form.com/)
  * [Zod](https://zod.dev/)
  * [HeroUI](https://www.heroui.com/)
  * [tailwindcss-motion](https://tailwindcss-motion.rombo.co/)
  * [Framer Motion](https://www.framer.com/motion/) (módulo `ui-extra`)
  * [Recharts](https://recharts.org/)
  * [TailwindCSS](https://tailwindcss.com/docs)

  ### DevOps

  * [Docker](https://docs.docker.com/)
  * [Docker Compose](https://docs.docker.com/compose/)
  * [Apache HTTP Server 2.4](https://httpd.apache.org/docs/2.4/)
  * [Supervisor](http://supervisord.org/)
  * [Sentry for Symfony](https://docs.sentry.io/platforms/php/guides/symfony/)

  ---

  ## 13) ADRs — Decisões de Arquitetura

  Decisões não-óbvias que foram tomadas no projeto e o raciocínio por trás de cada uma. Quando você voltar ao sistema após meses — ou quando alguém novo entrar — o "por quê" está registrado.

  ### UUID em vez de autoincrement

  **Decisão:** chave primária como UUID v4/v7, não `INT AUTO_INCREMENT`.

  **Motivo:** IDs sequenciais vazam volume de dados (request `GET /recursos/847` revela que existem 847 recursos), permitem enumeration attacks e dificultam merge de dados entre ambientes (staging → prod). UUID elimina esses três problemas e habilita geração do ID no cliente antes da inserção no banco — simplificando testes, seeds e eventos assíncronos.

  ### Português nos nomes

  **Decisão:** todo o código em português — entidades, métodos, variáveis, rotas internas.

  **Motivo:** o domínio de negócio é em português. `Pedido`, `StatusProcessamento`, `NomeFazenda` comunicam intenção sem tradução mental. Misturar `Animal` (classe) com `owner` (campo) em vez de `proprietario` acumula inconsistências ao longo do tempo. Times brasileiros não deveriam criar barreiras cognitivas desnecessárias.

  ### Zustand em vez de Redux ou Context API

  **Decisão:** Zustand para estado global compartilhado entre páginas.

  **Motivo:** Redux exige boilerplate desproporcional (actions, reducers, selectors) para casos simples como "usuário autenticado" e "lista de notificações". O Context do React re-renderiza todos os consumidores em qualquer mudança de `value` — problema real em apps com sidebar, notificações e filtros globais. Zustand resolve os dois: API mínima (um `create()`) + re-render seletivo por selector.

  ### Axios em vez de fetch nativo

  **Decisão:** Axios via instância centralizada `api.ts` em vez de `fetch` direto.

  **Motivo:** `fetch` não lança exceção em status 4xx/5xx por padrão — exige `if (!response.ok) throw ...` em toda chamada. Axios lança automaticamente. A instância `api.ts` injeta o JWT em todas as requests num único `interceptors.request`, trata `401` globalmente para logout automático via `interceptors.response`, e centraliza `baseURL` e `timeout`. Fazer o equivalente com fetch nativo seria escrever o mesmo wrapper que o Axios já é.

  ### PHP 8.4 + Symfony em vez de Node/Python

  **Decisão:** backend em Symfony.

  **Motivo:** Doctrine ORM + Migrations + Messenger + Validator + Serializer formam um ecossistema coeso que resolve 90% dos problemas de uma API REST sem bibliotecas extras. PHP 8.4 com tipagem forte + PHPStan nível 6 se aproxima do DX de TypeScript no backend. O Symfony Messenger elimina a necessidade de um broker separado para filas simples.
  
  ---
  
  ## 14) Evolução e Manutenção do Subflow
  
  **Decisão:** O subflow é um template para novos projetos, não um pacote (library) distribuído.
  
  **Propagação de Melhorias:**
  *   Uma vez clonado, o projeto diverge do esqueleto original.
  *   Melhorias críticas de segurança ou atualizações de padrões estruturais devem ser portadas **manualmente** de projeto em projeto.
  *   **Trade-off aceito:** Preferimos a liberdade total de evolução de cada produto em vez de um acoplamento rígido a um pacote de "framework interno" que impeça o time de tomar decisões rápidas em cada contexto.
  
  ---
  
  © 2026 - subflow Team. Desenvolvido para produtividade extrema.
