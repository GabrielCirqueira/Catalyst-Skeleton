# 📁 Estrutura do Projeto

Este documento descreve a organização de diretórios e arquivos do **Catalyst Skeleton**.

---

## 🗂️ Raiz do Projeto

A raiz foi organizada para manter apenas arquivos essenciais e pastas principais:

```
📦 catalyst-skeleton/
├── 📂 .tooling/              # Todas as configurações centralizadas
├── 📂 assets/               # Assets Symfony (Stimulus)
├── 📂 bin/                  # Executáveis (console, phpunit)
├── 📂 cli/                  # Scripts CLI de desenvolvimento
├── 📂 config/               # Configurações Symfony (bundles, services)
├── 📂 devops/               # Scripts de deploy e operações
├── 📂 docker/               # Dockerfiles e compose
├── 📂 documentation/        # Documentação técnica detalhada
├── 📂 leading/              # Guias e padrões de desenvolvimento
├── 📂 migrations/           # Migrations do Doctrine
├── 📂 public/               # Entry point web (index.php)
├── 📂 scripts/              # Scripts de setup e automação
├── 📂 src/                  # Código-fonte PHP/Symfony
├── 📂 templates/            # Templates Twig
├── 📂 tests/                # Testes PHPUnit
├── 📂 var/                  # Cache e logs (gitignored)
├── 📂 vendor/               # Dependências Composer (gitignored)
├── 📂 web/                  # Código-fonte React/TypeScript
├── 🔧 composer.json         # Dependências PHP
├── 🔧 package.json          # Dependências Node
├── 📄 LICENSE
├── 📄 Makefile              # Comandos make para desenvolvimento
└── 📖 README.md             # Documentação principal
```

---

## ⚙️ Pasta `.tooling/` (Novo!)

Todas as configurações de ferramentas foram centralizadas em `.tooling/` para reduzir poluição na raiz e evitar confusão com `config/` do Symfony:

```
.tooling/
├── backend/
│   └── importmap.php              # Importmap do Asset Mapper
├── docker/
│   └── .dockerignore              # Arquivos ignorados pelo Docker
├── frontend/
│   ├── biome.json                 # Configuração Biome (lint/format)
│   ├── postcss.config.cjs         # PostCSS
│   ├── tailwind.config.cjs        # Tailwind CSS
│   ├── tsconfig.json              # TypeScript compiler
│   └── vite.config.js             # Vite bundler
├── git/
│   └── commitlint.config.js       # Validação de commits
├── quality/
│   ├── phpcs.xml                  # PHP CodeSniffer
│   ├── phpstan.neon               # PHPStan (análise estática)
│   └── phpunit.xml.dist           # PHPUnit (testes)
├── .editorconfig                  # EditorConfig
├── .setup-done                    # Marcador de setup concluído
└── .setup-progress                # Estado do setup

```

---

## 🎯 Benefícios da Nova Organização

### ✅ Antes
- **18+ arquivos** de configuração espalhados na raiz
- Difícil identificar o propósito de cada arquivo
- Poluição visual ao abrir o projeto

### ✅ Depois
- Raiz limpa com **apenas 5 arquivos** principais visíveis
- Configurações agrupadas por contexto (frontend, backend, quality, etc)
- Fácil navegação e manutenção

---

## 🔄 Como os Arquivos São Referenciados

Todos os scripts e ferramentas foram atualizados para referenciar os novos caminhos:

### Frontend (npm scripts)
```json
"scripts": {
  "dev": "vite --host --config .tooling/frontend/vite.config.js",
  "build": "vite build --config .tooling/frontend/vite.config.js",
  "lint": "biome lint web --config-path=.tooling/frontend",
  "type-check": "tsc --noEmit --project .tooling/frontend/tsconfig.json"
}
```

### Backend (scripts CLI)
```bash
# cli/phpstan.sh
phpstan analyse --configuration=.tooling/quality/phpstan.neon

# cli/phpcs.sh
phpcs --standard=/var/www/html/.tooling/quality/phpcs.xml
```

### Setup
```bash
# Execute o setup a partir da raiz
bash scripts/setup.sh
```

---

## 📚 Documentação Relacionada

- [README.md](README.md) - Visão geral e quick start
- [GUIA-GERAL.md](leading/GUIA-GERAL.md) - Padrões de desenvolvimento
- [DOCUMENTACAO_TECNICA.md](documentation/DOCUMENTACAO_TECNICA.md) - Referência técnica completa

---

## 🧹 Arquivos Mantidos na Raiz (obrigatórios)

Alguns arquivos **devem** permanecer na raiz por exigência das ferramentas:

- `composer.json` / `composer.lock` - Composer procura na raiz
- `package.json` / `package-lock.json` - npm procura na raiz
- `symfony.lock` - Symfony Flex gerencia na raiz
- `.env` / `.env.example` - Symfony procura na raiz
- `Makefile` - Make procura na raiz

---

**Atualizado em:** 15 de maio de 2026
