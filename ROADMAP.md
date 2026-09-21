# Roadmap — Fundação do Catalyst Skeleton v5

> Backlog e planejamento do projeto. Cada tópico descreve o que existe (ou faltava), por que importa e o que precisa acontecer. Marque `[x]` no checklist ao concluir.

**Numeração:** tópicos 1–20.

**Índice visual:** [PROGRESSO_ROADMAP.md](documentation/progresso/PROGRESSO_ROADMAP.md) · **Detalhamento:** [PROGRESSO_ROADMAP_1.md](documentation/progresso/PROGRESSO_ROADMAP_1.md)

---

## Índice

| # | Tópico |
|---|---|
| 1 | Stack núcleo PHP 8.4 + Symfony 7.3 + Docker Compose |
| 2 | Autenticação JWT RS256 com refresh token |
| 3 | Entidade Usuario, Repository e migration |
| 4 | AuthController — login, registro, me e refresh |
| 5 | Frontend React 19 + TypeScript 5.9 + Vite 7 |
| 6 | HeroUI v3 + Tailwind CSS 4 + cor brand |
| 7 | ThemeProvider (claro / escuro) |
| 8 | Primitivos de layout e texto |
| 9 | Header e Footer globais no MainLayout |
| 10 | Landing Home com showcase de componentes |
| 11 | Modal de autenticação (login / cadastro) |
| 12 | Páginas Login e Cadastro |
| 13 | RotaProtegida e store Zustand de auth |
| 14 | TanStack Query + Axios com interceptores JWT |
| 15 | ErrorBoundary e página 404 |
| 16 | Documentação técnica do skeleton |
| 17 | Makefile, Biome, PHPStan e PHP-CS-Fixer |
| 18 | Módulos opt-in (async, observability, ui-extra) |
| 19 | PHPUnit e pasta tests/ removidos |
| 20 | Sistema de progresso, roadmap e melhorias |

---

## Checklist

- [x] **1. Stack núcleo PHP 8.4 + Symfony 7.3 + Docker Compose**
- [x] **2. Autenticação JWT RS256 com refresh token**
- [x] **3. Entidade Usuario, Repository e migration**
- [x] **4. AuthController — login, registro, me e refresh**
- [x] **5. Frontend React 19 + TypeScript 5.9 + Vite 7**
- [x] **6. HeroUI v3 + Tailwind CSS 4 + cor brand**
- [x] **7. ThemeProvider (claro / escuro)**
- [x] **8. Primitivos de layout e texto**
- [x] **9. Header e Footer globais no MainLayout**
- [x] **10. Landing Home com showcase de componentes**
- [x] **11. Modal de autenticação (login / cadastro)**
- [x] **12. Páginas Login e Cadastro**
- [x] **13. RotaProtegida e store Zustand de auth**
- [x] **14. TanStack Query + Axios com interceptores JWT**
- [x] **15. ErrorBoundary e página 404**
- [x] **16. Documentação técnica do skeleton**
- [x] **17. Makefile, Biome, PHPStan e PHP-CS-Fixer**
- [x] **18. Módulos opt-in (async, observability, ui-extra)**
- [x] **19. PHPUnit e pasta tests/ removidos**
- [x] **20. Sistema de progresso, roadmap e melhorias**

---

## Detalhamento

### Tópico 1 — Stack núcleo PHP 8.4 + Symfony 7.3 + Docker Compose

**O que existe hoje:** stack containerizada com Symfony 7.3, PHP 8.4, MySQL 8.3, Nginx/Apache e Vite.

**Por que importa:** é a base de todo projeto gerado a partir do skeleton.

**O que precisa acontecer:** manter o núcleo enxuto; módulos extras entram só via `setup.sh`.

---

### Tópico 2 — Autenticação JWT RS256 com refresh token

**O que existe hoje:** Lexik JWT + Gesdinet Refresh, chaves RS256 geradas no setup.

**Por que importa:** autenticação stateless pronta para produção sem reinventar o fluxo.

**O que precisa acontecer:** login, refresh e logout padronizados em `/api/v1/auth/*`.

---

### Tópico 3 — Entidade Usuario, Repository e migration

**O que existe hoje:** `Usuario` com UUID, `UsuarioRepository` e migration inicial.

**Por que importa:** persistência de contas sem `EntityManager` nos services.

**O que precisa acontecer:** CRUD de usuário passa sempre pelo repository.

---

### Tópico 4 — AuthController — login, registro, me e refresh

**O que existe hoje:** endpoints de autenticação com DTOs e envelope `{ success, data }` via `DefaultController`.

**Por que importa:** contrato HTTP único para o frontend.

**O que precisa acontecer:** controller só orquestra; regra de negócio fica no service.

---

### Tópico 5 — Frontend React 19 + TypeScript 5.9 + Vite 7

**O que existe hoje:** SPA em `web/` com Vite 7, TypeScript strict e lazy routes.

**Por que importa:** HMR rápido e tipagem sem `any`.

**O que precisa acontecer:** features em `web/features/`, sem `useEffect` em pages.

---

### Tópico 6 — HeroUI v3 + Tailwind CSS 4 + cor brand

**O que existe hoje:** `@heroui/react` + `@heroui/styles`, paleta brand violeta no `index.css`.

**Por que importa:** UI acessível sem editar `node_modules`.

**O que precisa acontecer:** customizar só via `className`, CSS variables e slots.

---

### Tópico 7 — ThemeProvider (claro / escuro)

**O que existe hoje:** `ThemeContext` com classe `dark` no `<html>` e toggle no Header.

**Por que importa:** tema consistente em todas as páginas do MainLayout.

**O que precisa acontecer:** persistir preferência e não duplicar o toggle nas pages.

---

### Tópico 8 — Primitivos de layout e texto

**O que existe hoje:** `Box`, `HStack`, `VStack`, `Flex`, `Grid`, `Container` e `Text` em `web/shared/ui/layout.tsx`.

**Por que importa:** proíbe `<div>`, `<p>`, `<h1>`–`<h6>` e `<span>` brutos.

**O que precisa acontecer:** sempre importar de `@/shared/ui/layout`.

---

### Tópico 9 — Header e Footer globais no MainLayout

**O que existe hoje:** `web/layouts/Header.tsx` e `Footer.tsx` renderizados pelo `MainLayout`.

**Por que importa:** navbar e rodapé não devem ser recriados em cada página.

**O que precisa acontecer:** páginas usam só o `Outlet`; modal de auth vive no layout.

---

### Tópico 10 — Landing Home com showcase de componentes

**O que existe hoje:** `web/features/home/Home.tsx` com hero, cards HeroUI, stack e CTA.

**Por que importa:** demonstra o design system no primeiro acesso.

**O que precisa acontecer:** Home não duplica Header/Footer.

---

### Tópico 11 — Modal de autenticação (login / cadastro)

**O que existe hoje:** `ModalAuth` aberto pelo Header via contexto do `MainLayout`.

**Por que importa:** login sem sair da landing.

**O que precisa acontecer:** estado do modal no layout, conteúdo da Home memoizado.

---

### Tópico 12 — Páginas Login e Cadastro

**O que existe hoje:** rotas `/login` e `/cadastro` com validação Zod.

**Por que importa:** fluxo de auth também funciona sem o modal.

**O que precisa acontecer:** Header esconde o botão Entrar nessas rotas.

---

### Tópico 13 — RotaProtegida e store Zustand de auth

**O que existe hoje:** `useAuthStore` com persist e `RotaProtegida` redirecionando para `/login`.

**Por que importa:** área `/app` só para usuário autenticado.

**O que precisa acontecer:** não espalhar checagem de token nas pages.

---

### Tópico 14 — TanStack Query + Axios com interceptores JWT

**O que existe hoje:** `web/config/api.ts` injeta Bearer e faz refresh em 401.

**Por que importa:** fila de retry evita refresh concorrente.

**O que precisa acontecer:** hooks de feature consomem `api.ts`, nunca axios solto.

---

### Tópico 15 — ErrorBoundary e página 404

**O que existe hoje:** `ErrorBoundary` e `features/not-found/NotFound.tsx`.

**Por que importa:** falha de render e rota inexistente têm UI própria.

**O que precisa acontecer:** 404 preenche o espaço entre Header e Footer.

---

### Tópico 16 — Documentação técnica do skeleton

**O que existe hoje:** `documentation/stack/FRONTEND.md`, `documentation/stack/BACKEND.md`, `documentation/referencia/DOCUMENTACAO_TECNICA.md`, `documentation/guias/Estruturação.md`.

**Por que importa:** IAs e o time seguem o mesmo contrato.

**O que precisa acontecer:** mudanças de regra atualizam esses arquivos em cadeia.

---

### Tópico 17 — Makefile, Biome, PHPStan e PHP-CS-Fixer

**O que existe hoje:** `make lint-all`, `fix-tsx`, `phpstan`, testes e Docker.

**Por que importa:** qualidade reproduzível no container.

**O que precisa acontecer:** não pular hooks; `make lint-all` antes de PR.

---

### Tópico 18 — Módulos opt-in (async, observability, ui-extra)

**O que existe hoje:** `.skeleton-modules/` copiados só quando o setup ativa o módulo.

**Por que importa:** núcleo sem Messenger/Sentry/Framer até haver necessidade.

**O que precisa acontecer:** não instalar módulo “por precaução”.

---

### Tópico 19 — PHPUnit e pasta tests/ removidos

**O que existe hoje:** sem suite PHPUnit, sem pasta `tests/`.

**Por que importa:** o skeleton não carrega fluxo de testes automatizados.

**O que precisa acontecer:** qualidade via `make phpstan` e `make lint-all`.

---

### Tópico 20 — Sistema de progresso, roadmap e melhorias

**O que existe hoje:** `ROADMAP.md`, `documentation/progresso/PROGRESSO_ROADMAP.md`, arquivos paginados e scripts.

**Por que importa:** histórico navegável sem um markdown gigante.

**O que precisa acontecer:** `make progresso` após marcar o checklist ou ao abrir um lote novo.
