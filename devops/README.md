# devops/

Scripts de operações para o ambiente de **produção**. Todos devem ser executados a partir da raiz do projeto.

---

## Fluxo de deploy (resumo)

```
LOCALMENTE                          NA VPS (primeira vez)       NA VPS (atualizações)
─────────────────────               ─────────────────────────   ─────────────────────
1. bash setup.sh          →         git clone <repo> /opt/app
2. (código pronto)                  cd /opt/app
3. git push                →        bash devops/deploy.sh   →   bash devops/update.sh
```

> Não é necessário nenhum script local antes do deploy. O `deploy.sh` é **totalmente interativo** — coleta domínio, e-mail e nome do banco na VPS e configura tudo automaticamente.

---

## Scripts

### `deploy.sh` — Primeiro deploy completo (execute **na VPS**)

Configura tudo do zero na VPS. Execute uma única vez após clonar o repositório.
Se o script falhar em algum passo, basta rodá-lo novamente — ele retoma de onde parou (estado salvo em `.deploy-progress`).

```bash
# Na VPS:
git clone <url-do-repo> /opt/app && cd /opt/app
bash devops/deploy.sh
```

**Pré-requisitos na VPS (apenas):** `docker` (com plugin compose), `git`, `openssl`, `curl`.
Node.js **não é necessário** — o build do React roda dentro de um container `node:20`.

**O que faz (11 passos):**
1. **Configuração interativa** — pergunta domínio, e-mail SSL, nome e usuário do banco, branch git. Salva no `.deploy-progress` para retomada.
2. **Pré-requisitos** — verifica Docker, git, openssl, curl
3. **`git pull`** — atualiza o código na branch escolhida
4. **`.env` de produção** — gera automaticamente todos os segredos (APP_SECRET, JWT_PASSPHRASE, DB_PASSWORD, DB_ROOT_PASSWORD) e monta o `.env` completo
5. **Nginx** — atualiza o `server_name` no `prod.conf` para o domínio informado
6. **Build React** — via `docker run node:20` (sem npm no host): `npm ci && npm run build`
7. **Build Docker** — `docker compose build --no-cache symfony` com pre-pull das imagens base
8. **Banco de dados** — sobe MySQL e aguarda ficar pronto (máx 90s)
9. **Container Symfony** — sobe PHP-FPM; o `bootstrap.sh` executa: chaves JWT, migrations, cache warmup. Aguarda healthcheck (máx 120s).
10. **Nginx** — sobe e aguarda resposta HTTP
11. **SSL** — verifica DNS e emite certificado Let's Encrypt via Certbot

**Retomada automática:** se o script falhar, ao rodar novamente ele pula os passos já concluídos.

**Reset total:** se algo estiver muito errado, o script oferece a opção de reset — remove `.env`, `public/build`, chaves JWT e derruba os containers para recomeçar do zero.

---

### `update.sh` — Atualização incremental (execute **na VPS** a cada nova versão)

Usado no dia a dia para publicar novas versões de código. **Mais rápido** que `deploy.sh` — não reconfigura o ambiente do zero.

```bash
bash devops/update.sh
```

**O que faz:**
1. `git pull origin main`
2. Rebuilda o React **apenas se** arquivos de frontend mudaram
3. Rebuilda a imagem Docker **apenas se** `composer.json/lock`, `Dockerfile` ou configs do Docker mudaram (caso contrário, reutiliza a imagem atual)
4. Recria o container Symfony com rollback automático em caso de falha

---

### `backup.sh` — Backup do banco de dados

Gera um dump comprimido (`.sql.gz`) do banco MySQL de produção em `/var/backups/catalyst-skeleton/`.
Retém apenas os backups dos últimos **7 dias** (configurável via `RETENTION_DAYS`).

```bash
bash devops/backup.sh
```

Configure via cron na VPS:

```cron
0 3 * * * /opt/app/devops/backup.sh >> /var/log/backup.log 2>&1
```

---

### `monitor.sh` — Monitoramento de containers

Verifica o status de saúde dos containers `symfony`, `database` e `nginx`.
Se algum estiver fora do padrão, imprime alerta e envia notificação para o Slack (opcional).

```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/... bash devops/monitor.sh
```

---

### `logs-dev.sh` — Visualizador de logs (desenvolvimento)

Menu interativo com acesso a todos os logs do ambiente local.

```bash
bash devops/logs-dev.sh          # menu interativo
bash devops/logs-dev.sh 5        # vai direto para a opção 5
LOG_TAIL=500 bash devops/logs-dev.sh
```

---

### `logs-prod.sh` — Visualizador de logs (produção)

Equivalente ao `logs-dev.sh` para produção. Inclui OPcache, histórico de deploys e healthcheck.

```bash
bash devops/logs-prod.sh         # menu interativo
bash devops/logs-prod.sh 4       # vai direto para Symfony prod.log
```

---

## Variáveis de ambiente relevantes

| Variável             | Descrição                                                           |
|----------------------|---------------------------------------------------------------------|
| `SLACK_WEBHOOK_URL`  | Webhook do Slack para alertas do `monitor.sh`                       |
| `LOG_TAIL`           | Linhas iniciais nos viewers de log (padrão: `100`)                  |
| `RETENTION_DAYS`     | Dias de retenção de backups (padrão: `7`)                           |
| `CERTBOT_EMAIL`      | E-mail para certificados Let's Encrypt (configurado pelo `deploy.sh`) |
| `CERTBOT_DOMAIN`     | Domínio para o certificado SSL (configurado pelo `deploy.sh`)       |
