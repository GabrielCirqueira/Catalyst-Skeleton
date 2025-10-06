# Scripts CLI (pasta `cli/`)

Rotinas utilitárias para lint, fix e QA.

## Principais scripts
- `phpstan.sh`: roda PHPStan (usa o PHAR quando disponível e ignora o platform-check local).
- `phpcs.sh`: roda PHP_CodeSniffer com o ruleset `phpcs.xml`.
- `phpcbf.sh`: roda PHPCBF dentro do container Symfony para `src` e `tests`.
- `phpcbf-diff.sh`: roda PHPCBF somente nos arquivos PHP alterados segundo `git diff`.
- `frontend-lint.sh`: roda ESLint (sem `--fix`).
- `frontend-fix.sh`: roda ESLint com `--fix`.
- `run-qa.sh`: encadeia `phpstan` + `phpcs` + `eslint`.
- `pre-commit.sh`: chamado pelo hook git para validações antes do commit.
- `install-hooks.sh`: instala o hook de `pre-commit` (symlink para `cli/pre-commit.sh`).

## Hooks Git
- Rodar `composer install` ou `composer update` instala/reinstala o hook automaticamente
  (via `composer.json` scripts `post-install-cmd` e `post-update-cmd`).
- Instalação manual: `./cli/install-hooks.sh`.

## Observações
- Os scripts de PHP preferem rodar no container (PHP 8.4). Em hosts com PHP < 8.4,
  os scripts ajustam o ambiente para evitar falhas do Composer platform-check.

