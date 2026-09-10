# Progresso do Roadmap — Feature 1 (Fundação do Catalyst Skeleton v5)

> Detalhamento dos tópicos 1 ao 20.

---

### ✅ Tópico 1 — Stack núcleo PHP 8.4 + Symfony 7.3 + Docker Compose

- **Status**: Concluído
- **Implementação**: Stack em `devops/docker-compose.yaml` com Symfony, Vite, MySQL e Supervisor. PHP 8.4 e Symfony 7.3 no `composer.json`.
- **Arquivos**: `devops/docker-compose.yaml`, `composer.json`, `devops/php/Dockerfile`

---

### ✅ Tópico 2 — Autenticação JWT RS256 com refresh token

- **Status**: Concluído
- **Implementação**: Lexik JWT + Gesdinet Refresh. Chaves RS256 geradas em `scripts/setup.sh` / `devops/bootstrap.sh`.
- **Arquivos**: `config/packages/lexik_jwt_authentication.yaml`, `config/packages/gesdinet_jwt_refresh_token.yaml`, `config/jwt/`

---

### ✅ Tópico 3 — Entidade Usuario, Repository e migration

- **Status**: Concluído
- **Implementação**: Entidade com UUID, getters sem prefixo `get`, `fromDTO`. Persistência só no repository.
- **Arquivos**: `src/Entity/Usuario.php`, `src/Repository/UsuarioRepository.php`, `migrations/Version20260315043928.php`

---

### ✅ Tópico 4 — AuthController — login, registro, me e refresh

- **Status**: Concluído
- **Implementação**: Rotas `/api/v1/auth/*` com DTOs e padrão Resultado. Controller sem regra de negócio.
- **Arquivos**: `src/Controller/Auth/AuthController.php`, `documentation/stack/AUTH.md`

---

### ✅ Tópico 5 — Frontend React 19 + TypeScript 5.9 + Vite 7

- **Status**: Concluído
- **Implementação**: SPA em `web/` com `createBrowserRouter`, lazy loading e `moduleResolution: bundler`.
- **Arquivos**: `web/App.tsx`, `web/main.tsx`, `tsconfig.json`, `package.json`

---

### ✅ Tópico 6 — HeroUI v3 + Tailwind CSS 4 + cor brand

- **Status**: Concluído
- **Implementação**: `@heroui/styles` + paleta `--color-brand-*` violeta. Sem `tailwind.config.js`.
- **Arquivos**: `web/index.css`, `documentation/stack/FRONTEND.md`

---

### ✅ Tópico 7 — ThemeProvider (claro / escuro)

- **Status**: Concluído
- **Implementação**: `ThemeProvider` no `main.tsx`, classe `dark` no `<html>`, toggle no Header.
- **Arquivos**: `web/contexts/ThemeContext.tsx`, `web/main.tsx`, `web/layouts/Header.tsx`

---

### ✅ Tópico 8 — Primitivos de layout e texto

- **Status**: Concluído
- **Implementação**: `Box`, `HStack`, `VStack`, `Flex`, `Grid`, `Container`, `Text as="h1"|span`. Proibido HTML bruto de layout/tipografia.
- **Arquivos**: `web/shared/ui/layout.tsx`, `documentation/guias/Estruturação.md`

---

### ✅ Tópico 9 — Header e Footer globais no MainLayout

- **Status**: Concluído
- **Implementação**: Casca `Header` + `Outlet` + `Footer`. Modal de auth e `abrirModal` via outlet context.
- **Arquivos**: `web/layouts/MainLayout.tsx`, `web/layouts/Header.tsx`, `web/layouts/Footer.tsx`

---

### ✅ Tópico 10 — Landing Home com showcase de componentes

- **Status**: Concluído
- **Implementação**: Hero, cards HeroUI, accordion de stack, steps e CTA. Sem navbar própria.
- **Arquivos**: `web/features/home/Home.tsx`

---

### ✅ Tópico 11 — Modal de autenticação (login / cadastro)

- **Status**: Concluído
- **Implementação**: `ModalAuth` no MainLayout. Home recebe `abrirModal` estável e permanece memoizada.
- **Arquivos**: `web/features/auth/ModalAuth.tsx`, `web/layouts/MainLayout.tsx`

---

### ✅ Tópico 12 — Páginas Login e Cadastro

- **Status**: Concluído
- **Implementação**: Formulários Zod em `/login` e `/cadastro`. Header oculta Entrar nessas rotas.
- **Arquivos**: `web/features/auth/Login.tsx`, `web/features/cadastro/Cadastro.tsx`

---

### ✅ Tópico 13 — RotaProtegida e store Zustand de auth

- **Status**: Concluído
- **Implementação**: Persist em `auth-storage`. `/app` exige `autenticado`.
- **Arquivos**: `web/stores/useAuthStore.ts`, `web/routes/RotaProtegida.tsx`

---

### ✅ Tópico 14 — TanStack Query + Axios com interceptores JWT

- **Status**: Concluído
- **Implementação**: Interceptor de request (Bearer) e de response (refresh em 401 com fila).
- **Arquivos**: `web/config/api.ts`, `web/main.tsx`

---

### ✅ Tópico 15 — ErrorBoundary e página 404

- **Status**: Concluído
- **Implementação**: Fallback com `VStack`/`Box`/`Text`. 404 com `flex-1` entre Header e Footer.
- **Arquivos**: `web/shared/components/ErrorBoundary.tsx`, `web/features/not-found/NotFound.tsx`

---

### ✅ Tópico 16 — Documentação técnica do skeleton

- **Status**: Concluído
- **Implementação**: Guias de frontend, backend, auth, testes, Docker e estruturação.
- **Arquivos**: `documentation/stack/FRONTEND.md`, `documentation/stack/BACKEND.md`, `documentation/referencia/DOCUMENTACAO_TECNICA.md`, `documentation/guias/Estruturação.md`

---

### ✅ Tópico 17 — Makefile, Biome, PHPStan e PHP-CS-Fixer

- **Status**: Concluído
- **Implementação**: Receitas `make lint-all`, `test`, `migrate` e scripts em `cli/` / `scripts/`.
- **Arquivos**: `Makefile`, `.tooling/frontend/biome.json`, `.tooling/quality/`

---

### ✅ Tópico 18 — Módulos opt-in (async, observability, ui-extra)

- **Status**: Concluído
- **Implementação**: Messenger/Sentry/Framer só entram pelo `setup.sh`.
- **Arquivos**: `.skeleton-modules/async/`, `.skeleton-modules/observability/`, `.skeleton-modules/ui-extra/`

---

### ✅ Tópico 19 — PHPUnit e pasta tests/ removidos

- **Status**: Concluído
- **Implementação**: Pacotes PHPUnit, pasta `tests/` e alvos `make test*` removidos.
- **Arquivos**: `composer.json`, `Makefile`

---

### ✅ Tópico 20 — Sistema de progresso, roadmap e melhorias

- **Status**: Concluído
- **Implementação**: Índices centrais + arquivos paginados (20 itens). `make progresso` sincroniza o índice e cria a página do lote se faltar.
- **Arquivos**: `ROADMAP.md`, `documentation/progresso/PROGRESSO_ROADMAP.md`, `scripts/update_roadmap.py`
