# Formatação e Lint (QA)

O projeto Catalyst Skeleton mantém um alto rigor de qualidade de código através de ferramentas de lint e análise estática unificadas para PHP e TypeScript.

## Frontend (Biome 1.9)
Utilizamos o **Biome** como substituto moderno para ESLint, Prettier e organizador de imports. O Biome é radicalmente mais rápido e unifica toda a análise em um único binário.

### Configuração (`biome.json`)
- **Linter**: Ativa regras essenciais de React 19 e acessibilidade.
- **Formatter**: Configurado para indentação via espaços (2), aspas simples e **sem ponto e vírgula** no final das linhas (estilo limpo).
- **Import Sorting**: Organiza automaticamente os imports por ordem alfabética e por grupos (nativos, externos, aliases `@/`).

### Comandos
- **Validar**: `make lint-tsx` (apenas leitura).
- **Corrigir**: `make fix-tsx` (aplica formatação e correções automáticas).

---

## Backend (PHP-CS-Fixer + PHPStan)
O backend segue o padrão **PSR-12** com adições para PHP 8.4 (modernizações de sintaxe e atributos).

### Linter de Estilo (`.php-cs-fixer.dist.php`)
- **Ferramenta**: PHP-CS-Fixer v3.
- **Regras**: PSR-12 unificado + modernizações (arrow functions, typed properties).
- **Comandos**: `make lint-php` (dry-run) ou `make fix-php` (fix real).

### Análise Estática (`phpstan.neon`)
- **Nível**: 6 (Análise forte de tipos, detecção de loops e caminhos de código inalcançáveis).
- **Alvo**: Todo o diretório `src/` e `tests/`.
- **Comando**: `./cli/phpstan.sh`.

---

## Ciclo de Vida do Commit (Husky)
Nenhum código entra no repositório sem passar pela verificação automática.
1. **`pre-commit`**: Dispara o script `cli/pre-commit.sh` via **Husky**.
2. **`lint-staged`**: Executa o Biome e o PHP-CS-Fixer apenas nos arquivos alterados (`staged`), garantindo commits rápidos e limpos.

### Como instalar os hooks
Caso tenha clonado o repo e não veja o Husky rodando:
```bash
./cli/install-hooks.sh   # Instalação manual
make install             # A instalação automática já inclui este passo
```
