# Catalyst Skeleton — Symfony 7 + React + Vite

<img width="1147" height="836" alt="image" src="https://github.com/user-attachments/assets/28e02cb8-297c-4af7-9ba6-1933e0698a0f" />


Starter moderno integrando Symfony (backend) e React (frontend), com Vite, Mantine UI e tooling de qualidade (ESLint/Prettier, PHPCS, PHPStan). Projetado para dev ágil com foco em performance e boas práticas.

## ✨ Tecnologias Principais

- Symfony 7.3 (PHP 8.4 no container)
- React 18 + TypeScript
- Vite 7 (HMR)
- Mantine 8 (UI)
- Lucide (ícones)
- ESLint + Prettier, PHPCS, PHPStan

## 🚀 Instalação

### Pré-requisitos (alternativas)

- Com Docker: Docker Desktop e Docker Compose (recomendado)
- Sem Docker: PHP 8.4+, Composer 2.6+, Node.js 18+

### Passo a Passo

1. **Clonar o repositório**
   ```bash
   git clone https://github.com/GabrielCirqueira/Catalyst-Skeleton.git
   cd Catalyst-Skeleton
   ```

2. **Instalar dependências PHP**
   ```bash
   composer install
   ```

3. **Instalar dependências JavaScript**
   ```bash
   npm install
   # ou com yarn
   yarn
   ```

4. **Iniciar servidores de desenvolvimento**
   ```bash
   # Recomendado: via Docker
   make up-d

   # Ou localmente
   npm install && npm run dev
   php -S localhost:8000 -t public # ou Apache/Nginx local
   ```

5. **Acessar a aplicação**
   - Backend: `http://localhost:8000` (configurável via `BACKEND_PORT` em `docker/ports.env`)
   - Frontend: `http://localhost:5173` (configurável via `FRONTEND_PORT` em `docker/ports.env`)

   > Ajuste os valores em `docker/ports.env` para trocar as portas expostas pela stack.

## 🏗️ Estrutura (high-level)

- `web/` — Frontend React (App, layouts, pages, theme)
- `templates/base.html.twig` — Shell do SPA com tags Vite
- `src/` — Backend Symfony (controllers, console, kernel)
- `config/` — Configurações do framework/bundles/rotas
- `docker-compose.yaml`, `Dockerfile`, `docker/` — Orquestração
- `cli/` — Scripts de lint/QA e hooks
- `Makefile` — Comandos de conveniência

## 🔍 Principais Funcionalidades

### Linting e Formatação

- Frontend: `npm run lint:frontend` (ou `lint:frontend:fix`)
- Backend: `composer lint:php:cs` (ou `composer fix:php`)
- Tudo: `./cli/run-qa.sh` (ou `npm run lint:all`)

### Frontend

- Componentes funcionais com Hooks
- Lazy routes (React Router)
- Tema centralizado (Mantine)
- Ícones Lucide

## 🛠️ Comandos Úteis

- `make up-d` — sobe a stack Docker
- `npm run dev` — Vite em modo dev (local)
- `npm run build` — build de produção
- `./cli/run-qa.sh` — roda todos os linters
- `make help` — lista todos os comandos do Makefile

## 📚 Documentação

Para uma visão mais detalhada, consulte:

- Frontend: documentation/frontend.md
- Backend (Symfony): documentation/backend.md
- Makefile (comandos): documentation/makefile.md
- Scripts CLI: documentation/cli.md
- Lint e formatação: documentation/formatting.md
- Docker e orquestração: documentation/docker.md

## 🎨 Tema

O tema Mantine inclui uma paleta personalizada `brand` definida em `web/themes/theme.ts`.

```ts
colors: {
  brand: {
      50: '#E6F6F7',
      100: '#B3E1E4',
      200: '#80CCCC',
      300: '#4DB7B3',
      400: '#26A3A0',
      500: '#1F8C89',
      600: '#186F6E',
      700: '#125355',
      800: '#0B393B',
      900: '#041F20',
  }
}
```

### Como usar as cores brand:
```tsx
// Exemplo de uso
<Box bg="brand.100" color="brand.700">
  <Text>Texto com cor brand</Text>
</Box>

<Button colorScheme="brand">Botão Primário</Button>
```

**Dica profissional:** Use `useColorModeValue` para alternar entre cores em light/dark mode:
```tsx
const color = useColorModeValue('brand.600', 'brand.300')
```

## 🛣️ Sistema de Rotas Avançado

### Backend (Symfony)
```yaml
# config/routes.yaml
react_frontend:
  path: /{reactRouting}
  controller: Symfony\Bundle\FrameworkBundle\Controller\TemplateController::templateAction
  defaults:
    template: 'base.html.twig'
  requirements:
    reactRouting: ".+"
```

Esta configuração permite que:
- Todas as rotas sejam manipuladas pelo React Router
- O Symfony sirva apenas o template base para o frontend
- URLs amigáveis e limpas

### Frontend (React Router)
Estrutura moderna com lazy loading:

```tsx
// Exemplo de roteamento lazy-loaded
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AppLayout />}>
      <Route 
        path="/" 
        lazy={() => import('@app/pages/Home')} 
      />
      <Route 
        path="/about" 
        lazy={() => import('@app/pages/About')} 
      />
      <Route 
        path="*" 
        lazy={() => import('@app/pages/NotFound')} 
      />
    </Route>
  )
)
```

**Vantagens:**
- Carregamento sob demanda (melhor performance)
- Código dividido automaticamente pelo Vite
- Fácil manutenção e adição de novas rotas

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.
