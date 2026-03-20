# devops/

Scripts de operações para o ambiente de **produção**. Todos devem ser executados a partir da raiz do projeto.

---

## Fluxo de deploy (resumo)

```
LOCALMENTE                          NA VPS (primeira vez)       NA VPS (atualizações)
─────────────────────               ─────────────────────────   ─────────────────────
1. bash setup.sh          →         git clone <repo> /opt/app
2. bash devops/pre-deploy.sh        cd /opt/app
3. git commit && git push  →        bash devops/deploy.sh   →   bash devops/update.sh
```

---

## Scripts

### `pre-deploy.sh` — Configuração pré-deploy (execute **localmente**)

Wizard interativo que coleta as informações de produção (domínio, VPS, banco de dados) e as aplica localmente nos arquivos de configuração:

- Substitui o domínio em `docker/nginx/prod.conf`
- Preenche `devops/.env.prod.example` com DB_NAME, DB_USER, VITE_API_BASE_URL, etc.
- Salva dados de acesso SSH em `devops/.pre-deploy.conf` (ignorado pelo git)
- Opcionalmente conecta na VPS via SSH e executa `deploy.sh` automaticamente

```bash
bash devops/pre-deploy.sh
```

Após executar, faça commit e push das alterações antes de rodar o deploy na VPS.

---

### `deploy.sh` — Primeiro deploy completo (execute **na VPS**)

Configura tudo do zero na VPS. Execute uma única vez após clonar o repositório.

```bash
# Na VPS:
git clone <url-do-repo> /opt/app && cd /opt/app
bash devops/deploy.sh
```

**O que faz:**
1. Verifica pré-requisitos (Docker, Node.js, git, openssl)
2. `git pull origin main`
3. Cria `.env` a partir de `devops/.env.prod.example` e **gera todos os segredos automaticamente** (APP_SECRET, JWT_PASSPHRASE, DB_PASSWORD, DB_ROOT_PASSWORD)
4. `npm ci && npm run build` — build do React (assets servidos pelo Nginx via volume)
5. `docker compose build --no-cache symfony` — build da imagem PHP de produção
6. Sobe o banco de dados e aguarda healthcheck
7. Sobe o container Symfony (executa `bootstrap.sh`: chaves JWT, migrations, cache warmup)
8. Sobe o Nginx
9. Emite certificado SSL via Certbot (Let's Encrypt)

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
| `CERTBOT_EMAIL`      | E-mail para certificados Let's Encrypt (definido pelo `pre-deploy.sh`) |
| `CERTBOT_DOMAIN`     | Domínio para o certificado SSL (definido pelo `pre-deploy.sh`)      |
