# Catalyst Skeleton — Documentação Técnica

Referência técnica completa do **Catalyst Skeleton** — fundação opinativa para aplicações full-stack construídas com **PHP 8.4 + Symfony 7.3** no backend e **React 19 + TypeScript 5.9** no frontend.

---

## Índice

1. [Stack de Tecnologias](#1-stack-de-tecnologias)
2. [Estrutura de Diretórios](#2-estrutura-de-diretórios)
3. [Variáveis de Ambiente](#3-variáveis-de-ambiente)
4. [Gestão de Portas](#4-gestão-de-portas)
5. [Arquitetura Backend](#5-arquitetura-backend)
   - [Padrão Resultado](#5-2-padrão-resultado)
   - [Regras de Ouro do Backend](#5-9-regras-de-ouro-do-backend)
6. [Arquitetura Frontend](#6-arquitetura-frontend)
7. [Banco de Dados e Migrations](#7-banco-de-dados-e-migrations)
8. [Mensageria Assíncrona](#8-mensageria-assíncrona)
9. [Qualidade de Código](#9-qualidade-de-código)
10. [Scaffolding e Makefile](#10-scaffolding-e-makefile)
11. [DevOps e Produção](#11-devops-e-produção)
12. [Logs e Observabilidade](#12-logs-e-observabilidade)
13. [Nomenclatura e Padrões](#13-nomenclatura-e-padrões)
14. [Versionamento do Skeleton](#14-versionamento-do-skeleton)

---

## 1. Stack de Tecnologias

### Backend

| Tecnologia | Versão | Papel |
| :--- | :--- | :--- |
| PHP | 8.4 | Runtime; usa Readonly Classes, Enums, Typed Properties e Attributes |
| Symfony | 7.3 | Framework principal (HTTP, DI container, Console, Scheduler, Mailer, Notifier) |
| Doctrine ORM | 3.x | ORM; mapeamento objeto-relacional, Unit of Work, migrations |
| MySQL | 8.3 | Banco de dados relacional (container `db`) |
| Apache | 2.4 | Servidor web em desenvolvimento (container `webserver`) |
| Nginx | 1.x | Servidor web em produção (TLS 1.2/1.3 + Certbot) |
| Supervisor | 4.x | Gerenciador de processos (workers Messenger) |
| LexikJWTAuthenticationBundle | 3.2 | Emissão e validação de access tokens JWT (RS256) |
| GesdinetJWTRefreshTokenBundle | 1.5 | Refresh token de 30 dias com renovação automática |
| Symfony Messenger | 7.x | Fila de mensagens com transporte Doctrine (padrão) |
| Symfony Scheduler | 7.x | Tarefas agendadas nativas |
| Symfony Rate Limiter | 7.x | Proteção contra brute-force em login e endpoints |
| NelmioCorsBundle | 3.x | Configuração CORS para todos os endpoints `/api/*` |
| Monolog | 3.x | Logs estruturados (JSON em produção) |
| Sentry SDK | 4.x | Rastreamento de erros (instalado, desativado por padrão) |
| PHPStan | 2.x | Análise estática — nível 6 |
| PHP_CodeSniffer | 3.x | Estilo de código PSR-12 |
| PHPUnit | 9.x | Testes unitários e de integração |

### Frontend

| Tecnologia | Versão | Papel |
| :--- | :--- | :--- |
| React | 19.1 | UI reativa com Concurrent Mode |
| TypeScript | 5.9 | Tipagem estática — modo strict |
| Vite | 7.2 | Build tool e dev server (HMR ultra-rápido) |
| TanStack Query | 5.90 | Cache de dados do servidor, refetching, invalidação |
| Zustand | 5.0 | Estado global leve com middleware `persist` (localStorage) |
| Axios | 1.12 | HTTP client centralizado com interceptores de JWT |
| React Router DOM | 7.9 | Roteamento client-side com lazy loading |
| React Hook Form | 7.66 | Formulários performáticos com validação Zod |
| Zod | 4.1 | Validação de schemas (forms, respostas de API) |
| Shadcn / Radix UI | — | Componentes UI acessíveis e sem-opinião de estilo |
| Tailwind CSS | 3.4 | Utilitários CSS — configuração customizada em `tailwind.config.cjs` |
| Framer Motion | 12.23 | Animações declarativas |
| Sonner | 2.0 | Sistema de toasts/notificações |
| Recharts | 2.15 | Gráficos reativos baseados em SVG |
| next-themes | 0.4 | Suporte a tema claro/escuro sem flash |
| Lucide / FontAwesome / Heroicons | — | Conjuntos de ícones |
| Biome | 1.9 | Linter + formatter + organizador de imports |
| Husky | 9.x | Git hooks (pre-commit) |
| lint-staged | 15.x | Executa linters apenas nos arquivos staged |
| Commitlint | 20.x | Enforça Conventional Commits na mensagem do commit |

---

## 2. Estrutura de Diretórios

```text
.
├── assets/                   # Assets Symfony (Encore/Stimulus)
├── bin/
│   ├── console               # Console Symfony
│   └── phpunit               # Script PHPUnit
│
├── cli/                      # Scripts de produtividade para desenvolvimento local
│   ├── new-feature.sh        # Scaffolding automático de nova feature
│   ├── run-qa.sh             # Executa bateria completa de QA
│   ├── check-naming.sh       # Verifica nomenclatura de classes/métodos
│   ├── phpstan.sh            # Roda PHPStan isolado
│   ├── phpcs.sh              # Roda PHP_CodeSniffer
│   ├── phpcbf.sh             # Auto-correção PHP_CodeSniffer
│   ├── phpcbf-diff.sh        # Mostra diff antes de corrigir
│   ├── frontend-lint.sh      # Roda Biome lint no frontend
│   ├── frontend-fix.sh       # Corrige lints e formata frontend via Biome
│   ├── install-hooks.sh      # Instala hooks do Husky
│   ├── pre-commit.sh         # Hook pre-commit (PHPStan + Biome)
│   ├── remove-comments.sh    # Remove comentários desnecessários
│   └── symfony               # Atalho: php bin/console dentro do container
│
├── config/
│   ├── bundles.php           # Registro de bundles Symfony
│   ├── preload.php           # OPcache preloading
│   ├── routes.yaml           # Rotas globais
│   ├── services.yaml         # DI container: autowiring, parâmetros
│   ├── jwt/                  # Chaves RS256 (geradas pelo bootstrap.sh)
│   └── packages/             # Configuração de cada bundle
│       ├── security.yaml                      # Firewalls, voters, role hierarchy
│       ├── lexik_jwt_authentication.yaml      # TTL do access token
│       ├── gesdinet_jwt_refresh_token.yaml    # TTL do refresh token (30 dias)
│       ├── messenger.yaml                     # Transports e routing de mensagens
│       ├── rate_limiter.yaml                  # Limitadores (login/api)
│       ├── nelmio_cors.yaml                   # Regras CORS
│       ├── monolog.yaml                       # Canais de log e handlers
│       └── sentry.yaml                        # Configuração do Sentry (DSN via .env)
│
├── devops/
│   ├── deploy.sh             # Deploy completo em produção
│   ├── update.sh             # Atualização incremental (sem downtime)
│   ├── backup.sh             # Backup do banco MySQL
│   ├── monitor.sh            # Verificação de saúde dos serviços
│   ├── logs-dev.sh           # Tail de logs em desenvolvimento
│   ├── logs-prod.sh          # Tail de logs em produção
│   └── README.md             # Instruções de uso dos scripts DevOps
│
├── docker/
│   ├── docker-compose.yaml       # Stack de desenvolvimento
│   ├── docker-compose.prod.yaml  # Stack de produção (multi-stage)
│   ├── bootstrap.sh              # Startup da aplicação (JWT keys, permissões)
│   ├── crontab                   # Crontab para container dev
│   ├── apache/000-default.conf   # VirtualHost Apache (dev)
│   ├── nginx/prod.conf           # Nginx com TLS 1.2/1.3 e cache de assets
│   ├── php/Dockerfile            # Multi-stage: base → dev → builder → prod
│   └── vite/Dockerfile           # Container de desenvolvimento Vite
│
├── migrations/               # Versionamento do schema (Doctrine Migrations)
│
├── public/
│   ├── index.php             # Front controller Symfony
│   └── build/                # Assets compilados pelo Vite (gitignored)
│
├── src/                      # Código PHP da aplicação
│   ├── Kernel.php
│   ├── Resultado.php         # Padrão de resultado de operações de negócio
│   ├── Command/              # Comandos CLI (Console Component)
│   ├── Controller/           # Controllers da API REST
│   ├── DataObject/           # DTOs: entrada validada de dados
│   ├── Domain/               # Lógica de domínio pura (opcional)
│   ├── Entity/               # Entidades Doctrine (UUID v7 como PK)
│   ├── Enum/                 # Enums PHP 8.1+ usados em entidades e DTOs
│   ├── Event/                # Eventos de domínio dispatched via EventDispatcher
│   ├── EventListener/        # Listeners (KernelExceptionListener, etc.)
│   ├── Message/              # Payloads de mensagens para o Messenger
│   ├── MessageHandler/       # Handlers que consomem as mensagens
│   ├── Repository/           # Acesso ao banco de dados via Doctrine
│   ├── Schedule/             # Tarefas agendadas (Symfony Scheduler)
│   ├── Serializer/           # Normalizadores para o JSON de saída (contrato da API)
│   ├── Service/              # Lógica de negócio e orquestração
│   ├── Specification/        # Padrão Specification para regras combináveis
│   └── ValueObject/          # Tipos primitivos com validação embutida no construtor
│
├── templates/
│   └── base.html.twig        # Base para e-mails e fallback server-side
│
├── tests/
│   ├── bootstrap.php         # Setup do ambiente de teste
│   ├── Unit/                 # Testes unitários (sem I/O)
│   └── Integration/          # Testes de integração (com banco de dados)
│
├── web/                      # Código TypeScript/React da SPA
│   ├── App.tsx               # Raiz da aplicação: providers e roteamento
│   ├── main.tsx              # Entry point: ReactDOM.createRoot
│   ├── index.css             # CSS global do frontend
│   ├── vite-env.d.ts         # Types de variáveis de ambiente Vite
│   ├── assets/               # Imagens e ícones estáticos
│   ├── config/api.ts         # Instância Axios centralizada com interceptores JWT
│   ├── contexts/             # Contextos React globais (ThemeProvider)
│   ├── features/             # Módulos funcionais autossuficientes
│   │   └── auth/             # Módulo de autenticação (páginas, calls, hooks)
│   ├── layouts/              # Layouts base (sidebar, main content, etc.)
│   ├── pages/                # Páginas folha carregadas via React.lazy()
│   ├── routes/RotaProtegida.tsx  # Guard: redireciona para /login se não autenticado
│   ├── shadcn/               # Componentes Shadcn UI (Radix UI) customizados
│   ├── shared/               # Componentes, hooks e utils reutilizáveis
│   └── stores/useAuthStore.ts    # Estado de autenticação (Zustand + persist)
│
├── biome.json                # Configuração do Biome (linter/formatter frontend)
├── commitlint.config.js      # Regras Conventional Commits
├── composer.json             # Dependências PHP + autoloading PSR-4
├── Makefile                  # Atalhos de comandos
├── package.json              # Dependências Node + scripts npm
├── phpcs.xml                 # Regras PHP_CodeSniffer (PSR-12 customizado)
├── phpstan.neon              # Configuração PHPStan (nível 6)
├── phpunit.xml.dist          # Configuração PHPUnit (suites Unit + Integration)
├── ports.env                 # Mapeamento de portas do ambiente local
├── setup.sh                  # Script de bootstrap inicial completo
├── supervisord.conf          # Configuração do Supervisor (workers Messenger)
├── tailwind.config.cjs       # Configuração Tailwind (cores, fontes, breakpoints)
├── tsconfig.json             # Configuração TypeScript (strict mode + aliases)
└── vite.config.js            # Configuração Vite (HMR, aliases, proxy)
```

---

## 3. Variáveis de Ambiente

O arquivo `.env` na raiz contém os valores padrão para desenvolvimento. Em produção, sobrescreva com `.env.local` ou variáveis de sistema operacional.

### Aplicação

| Variável | Exemplo | Descrição |
| :--- | :--- | :--- |
| `APP_ENV` | `dev` / `prod` | Ambiente da aplicação. `prod` ativa OPcache e desativa debug. |
| `APP_SECRET` | `changeme-32chars` | Chave criptográfica do Symfony. **Troque antes de produção.** O `bootstrap.sh` rejeita o valor padrão em `APP_ENV=prod`. |
| `APP_DOMAIN` | `api.meusite.com.br` | Domínio do backend (usado pelo Nginx e CORS). |
| `CORS_ALLOW_ORIGIN` | `https://meusite.com.br` | Origem permitida nas requisições cross-origin. |
| `FRONTEND_URL` | `https://meusite.com.br` | URL do frontend (usado em links de e-mail, redirects). |

### Banco de Dados

| Variável | Exemplo | Descrição |
| :--- | :--- | :--- |
| `DATABASE_URL` | `mysql://app:secret@db:3306/catalyst` | DSN Doctrine completo. O host `db` é o nome do service no Docker Compose. |
| `MYSQL_ROOT_PASSWORD` | `rootsecret` | Senha root do container MySQL. |
| `MYSQL_DATABASE` | `catalyst` | Nome do banco criado automaticamente. |
| `MYSQL_USER` | `app` | Usuário da aplicação. |
| `MYSQL_PASSWORD` | `secret` | Senha do usuário da aplicação. |

### JWT

| Variável | Exemplo | Descrição |
| :--- | :--- | :--- |
| `JWT_SECRET_KEY` | `%kernel.project_dir%/config/jwt/private.pem` | Caminho da chave privada RS256. |
| `JWT_PUBLIC_KEY` | `%kernel.project_dir%/config/jwt/public.pem` | Caminho da chave pública RS256. |
| `JWT_PASSPHRASE` | `changeme` | Passphrase da chave privada. Gerada no setup. |
| `JWT_TTL` | `3600` | Validade do access token em segundos (padrão: 1 hora). |

### Mensageria

| Variável | Exemplo | Descrição |
| :--- | :--- | :--- |
| `MESSENGER_TRANSPORT_DSN` | `doctrine://default?auto_setup=0` | DSN do transport Messenger. |

### Observabilidade

| Variável | Exemplo | Descrição |
| :--- | :--- | :--- |
| `SENTRY_DSN` | `https://abc@sentry.io/123` | DSN do Sentry. Deixe vazio para desabilitar. |
| `LOG_LEVEL` | `warning` | Nível mínimo de log em produção (Monolog). |

### Frontend (Vite)

Variáveis prefixadas com `VITE_` são expostas ao bundle via `import.meta.env`.

| Variável | Exemplo | Descrição |
| :--- | :--- | :--- |
| `VITE_API_URL` | `http://localhost:1010` | URL base da API consumida pelo Axios. |

---

## 4. Gestão de Portas

Definidas em `ports.env` e referenciadas pelo `docker-compose.yaml`. Edite esse arquivo para evitar conflitos com outros projetos locais.

| Container | Serviço | Porta Host (padrão) |
| :--- | :--- | :--- |
| `webserver` | Apache / Backend API | **1010** |
| `supervisor` | Painel Supervisor | **1011** |
| `vite` | Dev server frontend | **1012** |
| `db` | MySQL (acesso externo) | **1013** |

---

## 5. Arquitetura Backend

### 5.1 Camadas e Responsabilidades

| Camada | Pasta | Regra de ouro |
| :--- | :--- | :--- |
| **Entidades** | `src/Entity/` | Domínio rico. Invariantes e regras de negócio internas. PK em UUID v7. Sem getters/setters anêmicos. |
| **Value Objects** | `src/ValueObject/` | Tipos primitivos com validação no construtor. Imutáveis. |
| **DTOs** | `src/DataObject/` | Mapeiam o payload HTTP para um objeto tipado antes de chegar ao Service. |
| **Repositórios** | `src/Repository/` | Único lugar onde o `EntityManager` é injetado. Queries em DQL/QueryBuilder. |
| **Services** | `src/Service/` | Orquestração de operações de negócio. Retornam `Resultado`. Um service = uma ação (`executar()`). |
| **Serializers** | `src/Serializer/` | Definem o contrato JSON de saída. Protegem o frontend de mudanças internas no banco. |
| **Controllers** | `src/Controller/` | Lógica zero. Recebem request, chamam Service, retornam `JsonResponse`. |
| **Events / Listeners** | `src/Event/`, `src/EventListener/` | Desacoplamento de efeitos colaterais (e-mail, auditoria). |
| **Messages / Handlers** | `src/Message/`, `src/MessageHandler/` | Processamento assíncrono via Messenger. |
| **Commands** | `src/Command/` | CLI da aplicação via `php bin/console`. |
| **Schedule** | `src/Schedule/` | Tarefas recorrentes nativas do Symfony Scheduler. |
| **Specifications** | `src/Specification/` | Regras de negócio encapsuladas e combináveis. |

### 5.2 Padrão `Resultado`

`src/Resultado.php` encapsula o retorno de qualquer operação de negócio, eliminando o uso de exceções para casos previstos:

```php
// Em um Service:
public function executar(CriarUsuarioDTO $dto): Resultado
{
    if ($this->repositorio->emailExiste($dto->email)) {
        return Resultado::falha('email_duplicado');
    }

    $usuario = new Usuario($dto->nome, $dto->email);
    $this->repositorio->salvar($usuario);

    return Resultado::sucesso($usuario);
}

// Em um Controller:
$resultado = $this->criarUsuarioService->executar($dto);

if (!$resultado->ehSucesso()) {
    return $this->json(['sucesso' => false, 'erro' => $resultado->obterErro()], 409);
}

$dados = $this->serializer->normalizar($resultado->obterDados());
return $this->json(['sucesso' => true, 'dados' => $dados]);
```

**Métodos disponíveis:**

| Método | Descrição |
| :--- | :--- |
| `Resultado::sucesso($dados)` | Cria um resultado de sucesso carregando `$dados` |
| `Resultado::falha('codigo_erro')` | Cria um resultado de falha com código de erro (string) |
| `$resultado->ehSucesso()` | Retorna `true` se a operação foi bem-sucedida |
| `$resultado->obterDados()` | Retorna o payload em caso de sucesso |
| `$resultado->obterErro()` | Retorna o código de erro em caso de falha |

### 5.3 `KernelExceptionListener`

`src/EventListener/KernelExceptionListener.php` intercepta todas as exceções lançadas em rotas `/api/*` e as converte em respostas JSON padronizadas:

| Exceção | Código HTTP | Comportamento |
| :--- | :--- | :--- |
| `ValidationFailedException` | 422 | Extrai o mapa de erros de validação por campo |
| `DomainException` | Código do `getCode()` | Usa o código da exceção como status HTTP (400–422) |
| `HttpException` | Código da exceção | Reutiliza o status HTTP da própria exceção |
| Qualquer outra | 500 | Loga o stack trace completo; retorna mensagem genérica |

Resposta padrão para erros de validação:

```json
{
  "sucesso": false,
  "erro": "validacao_falhou",
  "campos": {
    "email": "Este e-mail já está em uso.",
    "senha": "A senha deve ter no mínimo 8 caracteres."
  }
}
```

### 5.4 Autenticação JWT

O sistema usa dois tokens:

| Token | Bundle | TTL padrão | Como é armazenado |
| :--- | :--- | :--- | :--- |
| Access token | LexikJWTAuthenticationBundle | 1 hora (`JWT_TTL`) | Memória JS (Zustand) |
| Refresh token | GesdinetJWTRefreshTokenBundle | 30 dias | Corpo da resposta / Cookie HttpOnly |

**Fluxo completo:**

```
POST /api/v1/auth/login    →  { token, refreshToken }
GET  /api/v1/recurso       →  Authorization: Bearer <access_token>
     [401 access expirado]
POST /api/v1/auth/refresh  →  { token }  (novo access token)
     [refresh expirado]    →  redireciona para /login
```

Configurações:
- `config/packages/lexik_jwt_authentication.yaml` — define `token_ttl`
- `config/packages/gesdinet_jwt_refresh_token.yaml` — define `ttl` (2592000s = 30 dias)

### 5.5 Segurança e Firewalls

`config/packages/security.yaml` define dois firewalls:

- `api` — sem estado (`stateless: true`), cobre `/api/*`, usa autenticação JWT
- `main` — firewall padrão para rotas web (se houver)

Endpoints públicos configurados em `access_control` (sem token necessário):
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/refresh`
- `GET  /api/v1/health`

### 5.6 Rate Limiting

`config/packages/rate_limiter.yaml`:

| Limitador | Endpoint | Limite | Janela |
| :--- | :--- | :--- | :--- |
| `login` | `/api/v1/auth/login` | 5 tentativas | 1 minuto |
| `api` | Todos os endpoints autenticados | 60 requisições | 1 minuto |

Respostas acima do limite retornam `HTTP 429 Too Many Requests`.

### 5.7 CORS

`config/packages/nelmio_cors.yaml` configura as origens permitidas para `/api/*`. Em desenvolvimento, `CORS_ALLOW_ORIGIN` aceita `*` por padrão. Em produção:

```dotenv
CORS_ALLOW_ORIGIN=https://meusite.com.br
```

### 5.8 Quando usar Serializer

**Regra:** todo endpoint que retorna dados de uma entidade **deve** passar por um Serializer. Nunca retorne a entidade diretamente ou monte o array no Controller.

| Situação | O que fazer |
| :--- | :--- |
| Endpoint retorna dados de uma entidade | Criar `src/Serializer/XxxSerializer.php` com método `normalizar()` |
| Endpoint retorna apenas confirmação (`{ sucesso: true }`) | Não precisa de Serializer — monte o array inline no Controller |
| Endpoint retorna lista paginada | O Serializer normaliza cada item; o Controller monta o envelope de paginação |
| Dois endpoints retornam a mesma entidade com campos diferentes | Criar dois Serializers (`UsuarioDetalheSerializer`, `UsuarioListaSerializer`) |

**Motivo:** o Serializer é o contrato entre backend e frontend. Sem ele, qualquer refatoração interna (renomear coluna, mover campo para outra entidade) quebra o frontend silenciosamente. Retornar array direto no Controller é uma dívida técnica garantida.

```php
// ✅ Correto
final class ProdutoSerializer
{
    public function normalizar(Produto $produto): array
    {
        return [
            'id'    => (string) $produto->getId(),
            'nome'  => $produto->getNome(),
            'preco' => $produto->getPreco()->getValor(),
        ];
    }

    /** @param Produto[] $produtos */
    public function normalizarLista(array $produtos): array
    {
        return array_map($this->normalizar(...), $produtos);
    }
}

// ❌ Nunca faça isso no Controller
return $this->json($produto); // expõe estrutura interna da entidade
```

---

## 5.9 Regras de Ouro do Backend

### 1. Early Return e Complexidade de Condições

Sempre ordene as suas **Guard Clauses** (cláusulas de guarda) pelo custo de processamento. Verificações de variáveis locais ou flags simples devem vir **antes** de chamadas a outros Services ou Repositories.

**O que fazer:**
```php
public function executar(int $filialId, bool $isAfastado): Resultado 
{
    // ✅ CORRETO: Checagem local primeiro (baixo custo)
    if ($isAfastado) {
        return Resultado::falha('usuario_afastado');
    }

    // Só chama o serviço secundário ou banco se passar pelas checagens básicas
    $permissaoFilial = $this->filialService->verificarAcesso($filialId);
    // ...
}
```

**Por que?** Evita processamento desnecessário, economiza recursos do banco de dados e torna o fluxo de execução mais limpo e previsível.

### 2. Services Atômicos e Resultado
- Um Service deve representar uma única ação de negócio (`executar()`).
- O retorno deve ser sempre via objeto `Resultado`, nunca lançando exceções para fluxo normal de negócio (ex: 'usuário não encontrado').

---

## 6. Arquitetura Frontend

### 6.1 Estrutura de Módulos (Feature-based)

O frontend é organizado por domínios funcionais, não por tipo de arquivo. Cada módulo em `web/features/` é autossuficiente:

```text
web/features/auth/
├── pages/
│   ├── Login.tsx
│   └── Register.tsx
├── hooks/
│   └── useLogin.ts          # Hook local com TanStack Query mutation
├── api/
│   └── authApi.ts           # Chamadas Axios específicas de autenticação
└── components/
    └── FormularioLogin.tsx
```

### 6.2 Instância Axios — `web/config/api.ts`

A instância centralizada implementa dois interceptores:

**Request interceptor** — injeta o access token em cada requisição:

```ts
config.headers.Authorization = `Bearer ${useAuthStore.getState().token}`;
```

**Response interceptor** — gerencia o fluxo de refresh token:
1. Se a resposta for `401` e não for para `/auth/refresh`:
   - Enfileira as requisições concorrentes (evita múltiplos refreshes simultâneos)
   - Faz `POST /api/v1/auth/refresh` com o `refreshToken` do store
   - **Sucesso:** atualiza o token no store e drena a fila com o novo token
   - **Falha:** chama `store.limpar()` e redireciona para `/login`
2. Todas as outras respostas seguem o fluxo normal

### 6.3 Store de Autenticação — `web/stores/useAuthStore.ts`

Estado global de autenticação usando Zustand com `persist` (localStorage, key: `auth-storage`):

```ts
interface AuthStore {
  usuario: Usuario | null;
  token: string | null;
  refreshToken: string | null;
  autenticado: boolean;

  setAutenticado: (usuario: Usuario, token: string, refreshToken: string) => void;
  setToken: (token: string) => void;
  limpar: () => void;
}
```

| Ação | Efeito |
| :--- | :--- |
| `setAutenticado` | Armazena usuário, tokens e marca `autenticado = true` |
| `setToken` | Atualiza apenas o access token (após refresh bem-sucedido) |
| `limpar` | Reseta todo o estado (logout ou refresh falhou) |

### 6.4 Guard de Rota — `web/routes/RotaProtegida.tsx`

```tsx
// Se não autenticado: redireciona para /login
// Se autenticado: renderiza a rota filha
export function RotaProtegida() {
  const autenticado = useAuthStore(s => s.autenticado);
  return autenticado ? <Outlet /> : <Navigate to="/login" replace />;
}
```

### 6.5 Aliases de Importação (Vite + TypeScript)

Configurados em `vite.config.js` e `tsconfig.json`:

| Alias | Resolve para |
| :--- | :--- |
| `@/` | `web/` |
| `@features/` | `web/features/` |
| `@shared/` | `web/shared/` |
| `@stores/` | `web/stores/` |
| `@config/` | `web/config/` |
| `@shadcn/` | `web/shadcn/` |

### 6.6 TanStack Query

Configurado em `web/App.tsx` com `QueryClient`. Padrões globais sugeridos:

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
    },
  },
});
```

### 6.7 Tema (next-themes)

`web/contexts/ThemeProvider.tsx` envolve a aplicação com o `ThemeProvider` do `next-themes`. O tema ativo é armazenado no `localStorage` e aplicado como classe `dark`/`light` no `<html>`. O Tailwind está configurado para `darkMode: 'class'`.

### 6.8 Fluxo Completo de Autenticação

Este é o ponto mais crítico da integração. O fluxo completo — login, proteção de rotas e logout — envolve três peças trabalhando juntas.

#### 1. Login (`web/features/auth/api/authApi.ts`)

```ts
import { api } from '@config/api';
import { useAuthStore } from '@stores/useAuthStore';

export async function login(email: string, senha: string): Promise<void> {
  const { data } = await api.post('/api/v1/auth/login', { email, senha });
  useAuthStore.getState().setAutenticado(data.usuario, data.token, data.refreshToken);
}

export async function logout(): Promise<void> {
  try {
    await api.post('/api/v1/auth/logout');
  } finally {
    useAuthStore.getState().limpar();
  }
}
```

#### 2. Hook de formulário de login (`web/features/auth/hooks/useLogin.ts`)

```ts
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/authApi';

export function useLogin() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ email, senha }: { email: string; senha: string }) =>
      login(email, senha),
    onSuccess: () => navigate('/dashboard'),
    onError: () => { /* toast de erro */ },
  });
}
```

#### 3. Refresh automático (`web/config/api.ts`)

O interceptor já cuida do refresh — **não é necessário tratar 401 manualmente** em nenhum hook ou página. Se o refresh falhar, `limpar()` é chamado e o usuário cai em `/login` via `RotaProtegida`.

#### 4. Configuração das rotas (`web/App.tsx`)

```tsx
<Routes>
  <Route path="/login" element={<Login />} />
  <Route element={<RotaProtegida />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/produtos" element={<ListarProdutos />} />
  </Route>
</Routes>
```

**Resumo do fluxo:**

```text
Usuário submete form
  → useLogin.mutate()
    → authApi.login()
      → POST /api/v1/auth/login
        → setAutenticado(usuario, token, refreshToken)
          → navigate('/dashboard')
            → RotaProtegida verifica autenticado === true → renderiza

Token expira (401)
  → interceptor faz POST /api/v1/auth/refresh
    → sucesso: setToken(novoToken), drena fila
    → falha:   limpar() → RotaProtegida redireciona para /login
```

---

## 6.9 Regras de Ouro do Frontend

### 1. O Banimento do `useEffect`

No Catalyst, o uso direto do `useEffect` é proibido. Efeitos colaterais descontrolados são a fonte número 1 de loops infinitos, race conditions e bugs de dessincronização.

**O que fazer em vez disso?**

- **Estado Derivado**: Se você precisa calcular algo baseado em outro estado, faça-o diretamente no corpo do componente (sem hooks extras) ou use `useMemo`.
- **Event Handlers**: Lógica de "quando isso acontecer" deve estar sempre em funções como `onClick`, `onSubmit` ou similar.
- **Data Fetching**: Use os hooks do **TanStack Query** (`useQuery`, `useMutation`).
- **Sincronização com Sistemas Externos (exclusivamente na montagem)**: Use `useMountEffect(() => { ... })`.

**Por que?** Banning o hook força a lógica a ser declarativa e previsível e desacoplada do ciclo de renderização, facilitando a manutenção tanto por humanos quanto por agentes de IA.

> [!TIP]
> Para efeitos que devem rodar quando dependências mudam, crie um hook nomeado em `web/shared/hooks/` que esconda a complexidade e dê um nome semântico à ação (ex: `useSyncCartWithLocalStorage`).

### 2. Imutabilidade e Estado

- Sempre trate o estado como imutável.
- Use Zod para validar dados vindos da API antes de guardá-los no estado global.

---

## 7. Banco de Dados e Migrations

### UUID v7 como Chave Primária

Todas as entidades usam **UUID v7** (time-ordered UUIDs) como chave primária. UUID v7 é ordenável cronologicamente, tornando-o adequado como PK em índices B-tree sem a fragmentação do UUID v4.

```php
#[ORM\Entity]
class Usuario
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidV7Generator::class)]
    private Uuid $id;
}
```

### Workflow de Migrations

```bash
# 1. Altere a Entity (adicione campo, mude tipo, etc.)
# 2. Gere a migration
make new-migration

# 3. Revise o arquivo gerado em migrations/
# 4. Aplique
make migrate

# Reverter a última migration (apenas em dev)
make rollback
```

As migrations ficam em `migrations/` no formato `VersionYYYYMMDDHHiiss.php`.

### Paginação

Padrão obrigatório para qualquer endpoint que liste recursos. O contrato de resposta deve ser consistente em toda a API.

**Resposta padronizada:**

```json
{
  "sucesso": true,
  "dados": [
    { "id": "...", "nome": "Produto A" }
  ],
  "paginacao": {
    "pagina": 1,
    "porPagina": 20,
    "total": 143,
    "totalPaginas": 8
  }
}
```

**Repository (`src/Repository/ProdutoRepository.php`):**

```php
/**
 * @return array{ items: Produto[], total: int }
 */
public function paginar(int $pagina, int $porPagina): array
{
    $qb = $this->createQueryBuilder('p')
        ->orderBy('p.criadoEm', 'DESC');

    $total = (clone $qb)->select('COUNT(p.id)')->getQuery()->getSingleScalarResult();

    $items = $qb
        ->setFirstResult(($pagina - 1) * $porPagina)
        ->setMaxResults($porPagina)
        ->getQuery()
        ->getResult();

    return ['items' => $items, 'total' => (int) $total];
}
```

**Controller (`src/Controller/ProdutoController.php`):**

```php
#[Route('/api/v1/produtos', methods: ['GET'])]
public function listar(Request $request): JsonResponse
{
    $pagina    = max(1, (int) $request->query->get('pagina', 1));
    $porPagina = min(100, max(1, (int) $request->query->get('porPagina', 20)));

    ['items' => $items, 'total' => $total] = $this->produtoRepository->paginar($pagina, $porPagina);

    return $this->json([
        'sucesso' => true,
        'dados'   => $this->produtoSerializer->normalizarLista($items),
        'paginacao' => [
            'pagina'       => $pagina,
            'porPagina'    => $porPagina,
            'total'        => $total,
            'totalPaginas' => (int) ceil($total / $porPagina),
        ],
    ]);
}
```

**Frontend (`web/features/produto/hooks/useProdutos.ts`):**

```ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@config/api';

interface RespostaPaginada<T> {
  sucesso: boolean;
  dados: T[];
  paginacao: { pagina: number; porPagina: number; total: number; totalPaginas: number };
}

export function useProdutos(pagina: number) {
  return useQuery({
    queryKey: ['produtos', pagina],
    queryFn: async () => {
      const { data } = await api.get<RespostaPaginada<Produto>>('/api/v1/produtos', {
        params: { pagina, porPagina: 20 },
      });
      return data;
    },
  });
}
```

---

## 8. Mensageria Assíncrona

### Symfony Messenger

O transporte padrão é **Doctrine** (tabela `messenger_messages`). Não é necessário configurar Redis ou RabbitMQ para começar.

```php
// 1. Crie o payload (Message)
final readonly class EnviarEmailBoasVindas
{
    public function __construct(
        public string $email,
        public string $nome,
    ) {}
}

// 2. Crie o Handler
#[AsMessageHandler]
final class EnviarEmailBoasVindasHandler
{
    public function __invoke(EnviarEmailBoasVindas $message): void
    {
        // Lógica de envio de e-mail...
    }
}

// 3. Dispatch no Service
$this->bus->dispatch(new EnviarEmailBoasVindas($usuario->email, $usuario->nome));
```

O roteamento de mensagens está em `config/packages/messenger.yaml`.

### Symfony Scheduler

Tarefas recorrentes ficam em `src/Schedule/` e implementam `ScheduleInterface`:

```php
#[AsSchedule]
final class TarefasRecorrentes implements ScheduleInterface
{
    public function getSchedule(): Schedule
    {
        return (new Schedule())->add(
            RecurringMessage::cron('0 2 * * *', new GerarRelatorioNocturno()),
        );
    }
}
```

### Workers (Supervisor)

Em produção, o Supervisor mantém os workers do Messenger sempre ativos. Configuração em `supervisord.conf`:

```ini
[program:messenger]
command=php /var/www/html/bin/console messenger:consume async --time-limit=3600
autostart=true
autorestart=true
numprocs=2
```

### Outbox Pattern

Use o Outbox quando a operação de negócio e o dispatch de mensagem precisam ser **atômicos** — ou seja, a mensagem só pode ser enviada se o dado foi persisitido com sucesso, e vice-versa. Sem Outbox, um crash entre o `flush()` e o `dispatch()` resulta em dado salvo mas evento perdido.

**Estrutura da tabela outbox (`migration`):**

```sql
CREATE TABLE outbox_events (
    id         CHAR(36)     NOT NULL PRIMARY KEY,
    tipo       VARCHAR(255) NOT NULL,
    payload    JSON         NOT NULL,
    criado_em  DATETIME(6)  NOT NULL,
    enviado_em DATETIME(6)  NULL
);
```

**Entidade (`src/Entity/OutboxEvent.php`):**

```php
#[ORM\Entity]
#[ORM\Table(name: 'outbox_events')]
class OutboxEvent
{
    #[ORM\Id, ORM\Column(type: 'uuid')]
    private Uuid $id;

    #[ORM\Column]
    private string $tipo;

    #[ORM\Column(type: 'json')]
    private array $payload;

    #[ORM\Column]
    private \DateTimeImmutable $criadoEm;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $enviadoEm = null;

    public function __construct(string $tipo, array $payload)
    {
        $this->id       = Uuid::v7();
        $this->tipo     = $tipo;
        $this->payload  = $payload;
        $this->criadoEm = new \DateTimeImmutable();
    }

    public function marcarComoEnviado(): void
    {
        $this->enviadoEm = new \DateTimeImmutable();
    }

    public function foiEnviado(): bool { return $this->enviadoEm !== null; }
    public function getTipo(): string  { return $this->tipo; }
    public function getPayload(): array { return $this->payload; }
}
```

**Uso no Service (mesma transação que o dado principal):**

```php
public function executar(CriarPedidoDTO $dto): Resultado
{
    $pedido = new Pedido(...);
    $this->em->persist($pedido);

    // Persiste o evento na mesma transação
    $evento = new OutboxEvent('pedido.criado', ['id' => (string) $pedido->getId()]);
    $this->em->persist($evento);

    $this->em->flush(); // atômico: pedido + evento

    return Resultado::sucesso($pedido);
}
```

**Worker (`src/Command/ProcessarOutboxCommand.php`):**

```php
#[AsCommand(name: 'app:outbox:processar')]
class ProcessarOutboxCommand extends Command
{
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $eventos = $this->outboxRepository->buscarNaoEnviados(limite: 100);

        foreach ($eventos as $evento) {
            $this->bus->dispatch(new GenericOutboxMessage($evento->getTipo(), $evento->getPayload()));
            $evento->marcarComoEnviado();
        }

        $this->em->flush();
        return Command::SUCCESS;
    }
}
```

Agende o worker via `MainScheduler` para rodar a cada 30 segundos ou conforme a latência aceitável do sistema.

---

## 9. Qualidade de Código

### Backend

| Ferramenta | Comando | O que faz |
| :--- | :--- | :--- |
| PHPStan | `make phpstan` | Análise estática, nível 6 (configurado em `phpstan.neon`) |
| PHP_CodeSniffer | `make phpcs` | Verifica estilo PSR-12 customizado (`phpcs.xml`) |
| PHP-CS-Fixer | `make phpcbf` | Corrige automaticamente violações de estilo |
| PHPUnit | `make test` | Executa suites Unit e Integration (`phpunit.xml.dist`) |
| Todos | `make qa` | Roda PHPStan + PHPCS + PHPUnit em sequência |

**Suites de teste (`phpunit.xml.dist`):**
- `Unit` — testa classes isoladas (Services, ValueObjects, Specifications) sem I/O
- `Integration` — testa com banco de dados real

### Frontend

| Ferramenta | Comando | O que faz |
| :--- | :--- | :--- |
| Biome (lint) | `make frontend-lint` | Verifica lints e problemas no código TS/TSX |
| Biome (format) | `make frontend-fix` | Formata e organiza imports automaticamente |
| TypeScript | `make ts-check` | Verifica tipos sem emitir arquivos (`tsc --noEmit`) |
| Husky + lint-staged | (automático) | No pre-commit: roda Biome nos arquivos staged |
| Commitlint | (automático) | No commit-msg: valida a mensagem do commit |

### Conventional Commits

Configurado em `commitlint.config.js`. Formato obrigatório:

```
<tipo>(escopo-opcional): <descrição no imperativo>

feat(auth): adicionar autenticação via Google OAuth
fix(usuario): corrigir validação de email duplicado
docs: atualizar documentação técnica
refactor(service): extrair lógica de envio de e-mail para handler
test(usuario): adicionar teste de integração para cadastro
chore: atualizar dependências do Composer
perf(query): otimizar consulta de listagem de pedidos
```

Tipos aceitos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `revert`.

---

## 10. Scaffolding e Makefile

### `cli/new-feature.sh`

Script interativo que gera a estrutura completa de uma nova feature. Para a feature `Produto`, gera:

**Backend:**
- `src/Entity/Produto.php` — entidade com UUID v7
- `src/DataObject/CriarProdutoDTO.php` — DTO de entrada
- `src/Service/CriarProdutoService.php` — service com método `executar()`
- `src/Controller/ProdutoController.php` — controller REST
- `src/Repository/ProdutoRepository.php` — repositório Doctrine
- `src/Serializer/ProdutoSerializer.php` — normalizador de saída

**Frontend:**
- `web/features/produto/pages/ListarProdutos.tsx`
- `web/features/produto/pages/CriarProduto.tsx`
- `web/features/produto/hooks/useProdutos.ts` — TanStack Query hook
- `web/features/produto/api/produtoApi.ts` — chamadas Axios

### Makefile — Referência Completa

| Alvo | Descrição |
| :--- | :--- |
| `make up` | Sobe todos os containers em background |
| `make down` | Para e remove os containers |
| `make restart` | Para e sobe novamente |
| `make logs` | Tail de logs do container principal |
| `make bash` | Abre shell no container PHP |
| `make install` | `composer install` + `npm install` |
| `make migrate` | Executa migrations pendentes |
| `make new-migration` | Gera nova migration (diff do schema) |
| `make rollback` | Reverte a última migration |
| `make phpstan` | Roda PHPStan |
| `make phpcs` | Roda PHP_CodeSniffer |
| `make phpcbf` | Corrige estilo PHP automaticamente |
| `make test` | Roda PHPUnit completo |
| `make test-unit` | Roda apenas a suite Unit |
| `make test-integration` | Roda apenas a suite Integration |
| `make qa` | PHPStan + PHPCS + PHPUnit |
| `make frontend-lint` | Biome lint no frontend |
| `make frontend-fix` | Biome fix + format no frontend |
| `make ts-check` | Verificação de tipos TypeScript |
| `make build` | Build de produção do frontend (Vite) |
| `make deploy` | Deploy completo em produção |
| `make backup-db` | Gera dump SQL do banco de produção |
| `make monitor` | Verifica saúde dos serviços |

---

## 11. DevOps e Produção

### 11.1 Dockerfile Multi-stage (`docker/php/Dockerfile`)

```
base    →  php:8.4-fpm-alpine + extensões (pdo_mysql, zip, intl, opcache)
  │
  ├── dev      →  base + Xdebug (via pecl); OPcache em modo permissivo
  │
  ├── builder  →  base + Composer; executa composer install --no-dev --optimize-autoloader
  │
  └── prod     →  copia vendor/ do builder; USER www-data; sem Xdebug; OPcache agressivo
```

O stage `prod` é a imagem final em `docker-compose.prod.yaml`.

### 11.2 `docker/bootstrap.sh` — Startup do Container

Executado como entrypoint do container PHP:

1. Ajusta permissões de `var/cache/` e `var/log/`
2. Se as chaves JWT não existirem, executa `php bin/console lexik:jwt:generate-keypair`
3. Em `APP_ENV=prod`, verifica se `APP_SECRET` ainda é o valor padrão — se sim, **aborta o container com erro**

### 11.3 Stack de Produção

```
Internet
   ↓
Nginx (TLS 1.2/1.3, HTTP/2, Certbot)
   ↓
PHP-FPM port 9000 (Alpine, sem Xdebug, OPcache ativo)
   ↓
MySQL 8.3
   +
Supervisor → Workers Messenger (2 processos, auto-restart)
```

Definida em `docker/docker-compose.prod.yaml`.

### 11.4 Nginx de Produção (`docker/nginx/prod.conf`)

- TLS 1.2 e 1.3 com certificados Let's Encrypt (Certbot)
- HTTP/2 habilitado
- Cache agressivo de assets estáticos: `Cache-Control: max-age=31536000, immutable`
- Proxy reverso para PHP-FPM via FastCGI
- Headers de segurança: HSTS, `X-Content-Type-Options`, `X-Frame-Options`

### 11.5 `devops/deploy.sh` — Deploy Completo

```bash
git pull origin main
composer install --no-dev --optimize-autoloader
npm ci && npm run build
php bin/console doctrine:migrations:migrate --no-interaction
php bin/console cache:clear --env=prod
sudo systemctl reload nginx
```

### 11.6 `devops/update.sh` — Atualização Incremental

Semelhante ao deploy, mas detecta se há mudanças de schema antes de rodar migrations, minimizando tempo de indisponibilidade.

### 11.7 `devops/backup.sh`

Cria dump MySQL com `mysqldump`, comprime com `gzip` e salva com timestamp:

```
backup_2026-01-15_02-30-00.sql.gz
```

### 11.8 `devops/monitor.sh`

Verifica e reporta:
- Status dos containers Docker
- Resposta do endpoint `GET /api/v1/health`
- Uso de disco
- Status dos workers do Supervisor

Pode enviar alerta por e-mail/webhook em caso de falha (configurável no topo do script).

### 11.9 SSL / Certbot

```bash
# Emitir certificado inicial
certbot --nginx -d api.meusite.com.br

# Renovação automática (crontab configurado no container nginx)
certbot renew --quiet
```

---

## 12. Logs e Observabilidade

### Monolog

`config/packages/monolog.yaml`:

| Ambiente | Formato | Destino | Nível mínimo |
| :--- | :--- | :--- | :--- |
| `dev` | Texto legível | `var/log/dev.log` | `debug` |
| `prod` | **JSON estruturado** | `stderr` (capturado pelo Docker) | `warning` |

Em produção, o JSON no stderr é capturado pelo Docker e pode ser encaminhado para Loki, Datadog, CloudWatch, etc. via driver de logging do Docker.

Exemplo de log JSON em produção:

```json
{
  "message": "Falha ao processar mensagem",
  "context": { "mensagem": "EnviarEmailBoasVindas", "tentativa": 3 },
  "level": 400,
  "level_name": "ERROR",
  "channel": "messenger",
  "datetime": "2026-01-15T02:30:00+00:00"
}
```

### Sentry

O SDK `sentry/sentry-symfony` está instalado. Para ativar:

```dotenv
# .env.local (produção)
SENTRY_DSN=https://sua-chave@sentry.io/seu-projeto
```

Sem `SENTRY_DSN` configurado, o bundle não envia nenhum dado. Configuração em `config/packages/sentry.yaml`.

### Health Check

```
GET /api/v1/health
```

Resposta esperada:

```json
{
  "status": "ok",
  "database": "ok",
  "timestamp": "2026-01-15T02:30:00+00:00"
}
```

Usado pelo `devops/monitor.sh` e por load balancers / orquestradores de containers.

---

## 13. Nomenclatura e Padrões

### Backend (PHP)

| Item | Padrão | Exemplo |
| :--- | :--- | :--- |
| Classes | `PascalCase` | `UsuarioService`, `CriarPedidoDTO` |
| Métodos | `camelCase` | `executar()`, `obterPorId()` |
| Variáveis | `camelCase` | `$totalPedidos`, `$usuarioAtual` |
| Constantes | `SCREAMING_SNAKE_CASE` | `MAX_TENTATIVAS`, `STATUS_ATIVO` |
| Services | Sufixo `Service` + verbo no nome | `CriarUsuarioService`, `EnviarEmailService` |
| Controllers | Sufixo `Controller` | `UsuarioController` |
| Repositórios | Sufixo `Repository` | `UsuarioRepository` |
| DTOs | Sufixo `DTO` | `CriarUsuarioDTO`, `AtualizarPedidoDTO` |
| Eventos | Sufixo `Event` | `UsuarioCriadoEvent` |
| Handlers | Sufixo `Handler` | `EnviarEmailBoasVindasHandler` |
| Enums | `PascalCase` (casos em `PascalCase`) | `StatusPedido::Pendente` |

### Frontend (TypeScript/React)

| Item | Padrão | Exemplo |
| :--- | :--- | :--- |
| Componentes | `PascalCase` | `ListarUsuarios`, `FormularioCadastro` |
| Hooks | `use` + `PascalCase` | `useUsuarios`, `useAuthStore` |
| Funções utilitárias | `camelCase` | `formatarData()`, `calcularTotal()` |
| Constantes | `SCREAMING_SNAKE_CASE` | `API_BASE_URL`, `MAX_RETRIES` |
| Tipos / Interfaces | `PascalCase` | `Usuario`, `RespostaAPI<T>` |
| Arquivos de componente | `PascalCase.tsx` | `ListarUsuarios.tsx` |
| Arquivos de hook | `camelCase.ts` | `useUsuarios.ts` |
| Arquivos de store | `camelCase.ts` | `useAuthStore.ts` |
| Arquivos de API calls | `camelCase.ts` | `usuarioApi.ts` |

### Rotas da API

- Prefixo obrigatório: `/api/v1/`
- Recursos no plural: `/api/v1/usuarios`, `/api/v1/pedidos`
- Ações via método HTTP: `GET` (listar/buscar), `POST` (criar), `PUT`/`PATCH` (atualizar), `DELETE` (remover)
- Todos os endpoints `/api/*` são cobertos pelo firewall JWT e pelo `KernelExceptionListener`

### Commits (Conventional Commits)

```
feat(produto): adicionar endpoint de listagem com filtros
fix(auth): corrigir refresh token expirado sem redirecionar
refactor(usuario): extrair validação de email para ValueObject
test(pedido): adicionar testes de integração para criação
docs: documentar padrão Resultado no DOCUMENTACAO_TECNICA.md
chore: atualizar Symfony para 7.3.2
perf(query): otimizar consulta de listagem com índice cobrindo
```

Tipos aceitos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `revert`.

---

## 14. Versionamento do Skeleton

O Catalyst Skeleton é versionado via **branches Git** no mesmo repositório. Cada versão maior vive em uma branch própria e permanece estável (sem novos commits após o lançamento da próxima versão).

| Branch | Versão | Status |
| :--- | :--- | :--- |
| `main` | **v4** (atual) | Desenvolvimento ativo — sempre a versão mais recente |
| `skeleton-v3` | v3 | Estável — somente bugfixes críticos |
| `skeleton-v2` | v2 | Legado — sem manutenção |
| `skeleton-v1` | v1 | Legado — sem manutenção |

### Como iniciar um projeto novo

Sempre use `main` como base:

```bash
git clone <repo> meu-projeto
cd meu-projeto
git checkout -b main-meu-projeto main  # branch local isolada do skeleton
```

### Como propagar melhorias do skeleton para um projeto existente

A propagação é **manual e intencional** — esse é o trade-off aceito ao usar o modelo de branches. Projetos existentes divergem do skeleton, e isso é esperado.

Fluxo recomendado:

1. Identifique o commit/PR no skeleton que contém a melhoria
2. Use `git cherry-pick <hash>` ou aplique manualmente no projeto destino
3. Resolva conflitos caso o projeto já tenha divergido naquela área

```bash
# No repositório do projeto existente:
git remote add skeleton <repo-skeleton>
git fetch skeleton main
git cherry-pick <hash-do-commit-no-skeleton>
```

### Política de breaking changes

- Mudanças de interface (contrato de API, estrutura de pastas, padrões obrigatórios) só ocorrem em versões maiores (nova branch)
- `main` pode receber adições retrocompatíveis a qualquer momento
- Projetos derivados **nunca** devem fazer merge de `main` do skeleton diretamente — usam cherry-pick seletivo

---

*Catalyst Skeleton — mantido com rigor de engenharia Symfony & React.*
