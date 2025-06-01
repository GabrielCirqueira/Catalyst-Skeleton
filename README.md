# Modern Symfony + React + Vite + Chakra UI Starter

![image](https://github.com/user-attachments/assets/7060048b-d585-4a1d-8b26-863d52c4a8d2)

Este é um starter kit moderno que integra o Symfony como backend com React no frontend, utilizando Vite como bundler e Chakra UI para estilização. A estrutura foi projetada para desenvolvimento ágil com foco em performance, qualidade de código e boas práticas.

## ✨ Tecnologias Principais

- **Symfony 6**: Framework PHP robusto para construção de APIs e backend
- **React 18**: Biblioteca JavaScript para interfaces dinâmicas com TypeScript
- **Vite**: Bundler ultra-rápido com hot module replacement
- **Chakra UI**: Biblioteca de componentes acessíveis e customizáveis
- **Lucide**: Ícones modernos e leves para a interface
- **ESLint + PHP CS Fixer**: Linters para manter a qualidade do código

## 🚀 Instalação

### Pré-requisitos

- PHP 8.2+
- Composer 2.6+
- Node.js 18+
- Yarn (opcional)

### Passo a Passo

1. **Clonar o repositório**
   ```bash
   git clone https://github.com/GabrielCirqueira/Skeleton-Symfony-React.git
   cd Skeleton-Symfony-React
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
   # Backend (Symfony)
   symfony serve -d
   
   # Frontend (Vite)
   npm run dev
   ```

5. **Acessar a aplicação**
   - Backend: `http://localhost:8000`
   - Frontend: `http://localhost:5173`

## 🏗️ Estrutura do Projeto

```
├── assets/
│   ├── js/
│   │   ├── app/            # Aplicação React principal
│   │   │   ├── layouts/    # Layouts compartilhados
│   │   │   ├── pages/      # Páginas lazy-loaded
│   │   │   └── themes/     # Configurações de tema
│   │   └── index.tsx       # Ponto de entrada
├── config/
│   └── routes.yaml         # Configuração de rotas
├── public/                 # Arquivos públicos
├── src/                    # Código PHP Symfony
├── .eslintrc               # Configuração ESLint
├── .php-cs-fixer.php       # Configuração PHP CS Fixer
├── package.json            # Dependências Node.js
├── composer.json           # Dependências PHP
└── vite.config.js          # Configuração Vite
```

## 🔍 Principais Funcionalidades

### Linting e Formatação

**JavaScript/TypeScript:**
```bash
npm run lint:tsx  # ESLint para arquivos React/TypeScript
```

**PHP:**
```bash
npm run lint:php  # PHP CS Fixer para padronização PHP
```

**Ambos:**
```bash
npm run lint:all  # Executa ambos os linters
```

Configurações padrão incluídas para:
- ESLint com plugins React e TypeScript
- Prettier para formatação automática
- PHP CS Fixer com padrões PSR-12

### Estrutura React Moderna

- **Componentes funcionais** com Hooks
- **Lazy loading** de páginas e componentes
- **Tema centralizado** com Chakra UI
- **Ícones** com Lucide React
- **Gerenciamento de estado** pronto para expansão

## 🛠️ Comandos Úteis

| Comando                | Descrição                                  |
|------------------------|-------------------------------------------|
| `npm run dev`          | Inicia Vite dev server                    |
| `npm run build`        | Build de produção                         |
| `npm run lint:tsx`     | Lint para arquivos TypeScript/JSX         |
| `npm run lint:php`     | Lint para arquivos PHP                    |
| `npm run lint:all`     | Executa todos os linters                  |
| `symfony serve -d`     | Inicia servidor Symfony em background     |

## 🎨 Design System
 
Nosso tema utiliza uma paleta de cores personalizada chamada **brand** que segue o padrão do Chakra UI:

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
