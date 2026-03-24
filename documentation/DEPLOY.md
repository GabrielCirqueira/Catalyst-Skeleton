A seguir está um tutorial/relatório completo (nível “do zero ao deploy automático”) para hospedar uma aplicação web moderna **Full Stack (Symfony/PHP + Frontend Vite/React + MySQL)** em uma **VPS com Docker**, com **Nginx como reverse proxy**, **domínio + SSL**, e **pipeline de deploy automático** (GitHub Actions). Inclui também uma seção de **erros comuns** que aparecem exatamente nesse tipo de projeto e como resolver sem perder tempo.

---

## 1) Visão geral da arquitetura (produção)

### Objetivo final

Você quer acessar:

* `https://app.seudominio.com`

Com:

* Nginx (no host da VPS) recebendo HTTPS/443
* Nginx repassando para o container do app (porta interna, ex.: 8085 → 80)
* Banco MySQL rodando em container com volume persistente
* Chaves JWT persistentes em volume (se usar JWT)
* Deploy automático: `push` na `main` → GitHub Actions → SSH na VPS → `git pull` → `docker compose up -d --build` → migrations

**Por que assim?**
Porque é o padrão prático/profissional em VPS: o host fica responsável por TLS e roteamento (Nginx), e a aplicação roda isolada em containers.

**Docs base:**

* Docker Compose em produção: [https://docs.docker.com/compose/production/](https://docs.docker.com/compose/production/)
* Reverse proxy Nginx: [https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
* Symfony deployment: [https://symfony.com/doc/current/deployment.html](https://symfony.com/doc/current/deployment.html)

---

## 2) Pré-requisitos

### Você precisa ter

* Uma VPS (Ubuntu recomendado)
* Um domínio gerenciado por você (Cloudflare, RegistroBR, etc.)
* Um repositório no GitHub com o projeto

### Convenções usadas no tutorial

* Pasta do projeto na VPS: `/var/www/app`
* Subdomínio: `app.seudominio.com`
* Docker Compose de produção: `docker-compose.prod.yml`
* Dockerfile de produção: `Dockerfile.prod`

---

## 3) Preparar a VPS (SO, firewall e pacotes base)

### Atualizar sistema e instalar utilitários

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg git ufw
```

### Firewall básico (UFW)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

Docs:

* UFW: [https://help.ubuntu.com/community/UFW](https://help.ubuntu.com/community/UFW)

---

## 4) Instalar Docker + Docker Compose (plugin)

Instalação padrão (Ubuntu):

```bash
sudo install -m 0755 -d /etc/apt/keyrings

curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
 | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu \
$(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
| sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update

sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo systemctl enable --now docker
docker --version
docker compose version
```

Docs:

* Docker Engine (Ubuntu): [https://docs.docker.com/engine/install/ubuntu/](https://docs.docker.com/engine/install/ubuntu/)
* Docker Compose plugin: [https://docs.docker.com/compose/install/](https://docs.docker.com/compose/install/)

---

## 5) DNS: criar subdomínio apontando para a VPS

No painel DNS do seu domínio, crie:

* Tipo: `A`
* Nome/Host: `app`
* Valor: `IP_DA_SUA_VPS`

Resultado:

* `app.seudominio.com` → IP da VPS

Docs:

* Conceitos de records: [https://www.cloudflare.com/learning/dns/dns-records/](https://www.cloudflare.com/learning/dns/dns-records/)

---

## 6) Nginx no host: reverse proxy para o container

### Instalar Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable --now nginx
```

### Criar arquivo de site

```bash
sudo nano /etc/nginx/sites-available/app
```

Conteúdo (HTTP por enquanto):

```nginx
server {
    server_name app.seudominio.com;

    location / {
        proxy_pass http://127.0.0.1:8085;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Ativar:

```bash
sudo ln -s /etc/nginx/sites-available/app /etc/nginx/sites-enabled/app
sudo nginx -t
sudo systemctl reload nginx
```

Docs:

* Reverse proxy Nginx: [https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)

---

## 7) SSL com Let’s Encrypt (Certbot)

### Instalar Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Gerar certificado

```bash
sudo certbot --nginx -d app.seudominio.com
```

Ele ajusta automaticamente o Nginx para HTTPS e renova.

Testar renovação:

```bash
sudo certbot renew --dry-run
```

Docs:

* Certbot Nginx: [https://certbot.eff.org/instructions](https://certbot.eff.org/instructions)

---

## 8) Estrutura do projeto: separando DEV e PROD

Em projetos com Docker, **DEV e PROD não podem ser o mesmo compose**.
No DEV você tem:

* volumes montando código
* Vite `npm run dev`
* portas expostas para debug

Na PROD você precisa:

* build fechado
* sem volumes montando código do host
* sem Vite dev server
* Nginx host apontando pro container

Docs:

* Compose produção: [https://docs.docker.com/compose/production/](https://docs.docker.com/compose/production/)

---

## 9) docker-compose.prod.yml (produção)

Exemplo robusto e comum:

```yaml
services:
  database:
    image: mysql:8.3
    container_name: app_db
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db_data:/var/lib/mysql
    networks:
      - app_net

  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    container_name: app_web
    restart: always
    env_file:
      - .env
    depends_on:
      - database
    ports:
      - "8085:80"
    volumes:
      - jwt_keys:/var/www/html/config/jwt
    networks:
      - app_net

networks:
  app_net:

volumes:
  db_data:
  jwt_keys:
```

### Pontos críticos

* **Banco não precisa expor porta** para internet.
* Porta `8085:80` fica só no host; Nginx faz o proxy.
* Volume `db_data` garante persistência.
* Volume `jwt_keys` garante persistência das chaves JWT.

Docs:

* Compose networking: [https://docs.docker.com/compose/networking/](https://docs.docker.com/compose/networking/)
* MySQL image env vars: [https://hub.docker.com/_/mysql](https://hub.docker.com/_/mysql)

---

## 10) Variáveis (.env) em produção sem bagunça

### Regra prática

* Use `.env` dentro do container para o Symfony (se você optar pelo fluxo “arquivo”).
* Use `.env.prod.example` no GitHub (sem segredos).
* Crie `.env` real **somente na VPS** (com segredos).

Docs:

* Symfony env vars: [https://symfony.com/doc/current/configuration.html#configuration-based-on-environment-variables](https://symfony.com/doc/current/configuration.html#configuration-based-on-environment-variables)
* Boas práticas: [https://symfony.com/doc/current/best_practices.html#use-environment-variables-for-infrastructure-configuration](https://symfony.com/doc/current/best_practices.html#use-environment-variables-for-infrastructure-configuration)

### Exemplo de `.env` de produção (na VPS)

```env
APP_ENV=prod
APP_DEBUG=0
APP_SECRET=UMA_STRING_FORTE

DB_ROOT_PASSWORD=uma_senha_forte
DB_NAME=app
DB_USER=app
DB_PASSWORD=uma_senha_forte

DATABASE_URL="mysql://app:uma_senha_forte@database:3306/app?serverVersion=8.3&charset=utf8mb4"

JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=uma_passphrase_compatível
```

> Importante: no Docker, `database` é o nome do serviço (hostname).
> Docs:

* Doctrine config: [https://symfony.com/doc/current/doctrine.html#configuring-the-database](https://symfony.com/doc/current/doctrine.html#configuring-the-database)

---

## 11) Dockerfile.prod (multi-stage: build frontend + build PHP)

Esse padrão resolve:

* não depender de Vite dev server em prod
* buildar assets uma vez
* servir assets prontos

Exemplo:

```dockerfile
# 1) Build do frontend
FROM node:20-alpine AS frontend
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# 2) PHP/Apache
FROM php:8.4-apache

RUN apt-get update && apt-get install -y \
    git unzip libicu-dev libzip-dev zip curl \
 && docker-php-ext-install pdo pdo_mysql intl opcache \
 && a2enmod rewrite headers

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html

COPY . .

RUN composer install --no-dev --no-interaction --optimize-autoloader --no-scripts

# Copie os assets buildados para o destino correto
# Exemplo comum: public/build
COPY --from=frontend /app/public/build ./public/build

# Permissões: ESSENCIAL em Symfony
RUN mkdir -p var/cache var/log \
    && chown -R www-data:www-data var \
    && chmod -R 775 var

COPY docker/apache/000-default.conf /etc/apache2/sites-available/000-default.conf

EXPOSE 80
CMD ["apache2-foreground"]
```

Docs:

* Multi-stage builds: [https://docs.docker.com/build/building/multi-stage/](https://docs.docker.com/build/building/multi-stage/)
* Composer install flags: [https://getcomposer.org/doc/03-cli.md#install](https://getcomposer.org/doc/03-cli.md#install)

---

## 12) .dockerignore (não quebrar o build)

Uma das causas mais comuns de build quebrado é `.dockerignore` ignorar arquivos essenciais (como `package.json`).

Use um `.dockerignore` seguro:

```gitignore
.git
node_modules
vendor
var
.env*
```

> Cuidado: se você decidir copiar `.env` para dentro da imagem, não ignore `.env`.
> Docs:

* .dockerignore: [https://docs.docker.com/build/concepts/context/#dockerignore-files](https://docs.docker.com/build/concepts/context/#dockerignore-files)

---

## 13) Subir em produção pela primeira vez

Na VPS:

```bash
sudo mkdir -p /var/www/app
sudo chown -R $USER:$USER /var/www/app
cd /var/www/app
git clone https://github.com/SEU_USUARIO/SEU_REPO.git .
```

Crie o `.env` de produção:

```bash
nano .env
```

Suba os containers:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### Migrations (sempre depois do DB estar pronto)

```bash
docker exec -it app_web php bin/console doctrine:migrations:migrate --no-interaction
```

Docs:

* Doctrine migrations: [https://symfony.com/bundles/DoctrineMigrationsBundle/current/index.html](https://symfony.com/bundles/DoctrineMigrationsBundle/current/index.html)

---

## 14) JWT em produção: evitar “bad decrypt” e perda de chaves

### Problema clássico

O login funciona, mas gerar token dá 500 com:

* `JWTEncodeFailureException`
* `bad decrypt`

Isso significa:

* passphrase no `.env` ≠ passphrase usada para gerar a private key

### Solução correta

Gerar as chaves uma vez e persistir (volume `jwt_keys`):

Com Lexik:

```bash
docker exec -it app_web php bin/console lexik:jwt:generate-keypair
```

Docs:

* LexikJWT: [https://symfony.com/bundles/LexikJWTAuthenticationBundle/current/index.html](https://symfony.com/bundles/LexikJWTAuthenticationBundle/current/index.html)

---

## 15) Permissões Symfony (o “500 de cache”)

Erro típico:

* `Permission denied` ao criar/renomear arquivos em `var/cache/prod`

Causa:

* `var/` criado como root
* Apache rodando como `www-data`

Correção imediata:

```bash
docker exec -it app_web bash -lc "rm -rf var/cache/* var/log/* && chown -R www-data:www-data var && chmod -R 775 var"
docker restart app_web
```

Docs:

* Symfony file permissions: [https://symfony.com/doc/current/setup/file_permissions.html](https://symfony.com/doc/current/setup/file_permissions.html)

---

## 16) CORS em produção (quando aparece e como matar de vez)

### Causa mais comum

Frontend aponta para `http://localhost:xxxx` em produção.

Solução:

* Em produção, use a mesma origem:

  * `fetch('/api/...')`
  * ou `VITE_API_URL=/api`

Assim você evita CORS completamente.

Docs:

* Same-origin / CORS (MDN): [https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

## 17) Deploy automático: GitHub Actions → SSH → VPS

### Estratégia

* O GitHub Actions entra via SSH na VPS
* Executa comandos:

  * `git pull`
  * `docker compose up -d --build`
  * `migrations`

### Secrets necessários no GitHub

Em `Settings → Secrets and variables → Actions`:

* `VPS_HOST` (IP)
* `VPS_USER` (ex: root ou deploy)
* `VPS_SSH_KEY` (private key)

Docs:

* Secrets: [https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)

### Criando chave de deploy para conectar NA VPS (não é deploy key do repo)

Na VPS:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/gh_actions_deploy
```

Adicione a pública no `authorized_keys`:

```bash
cat ~/.ssh/gh_actions_deploy.pub >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

Copie o conteúdo da privada para o secret `VPS_SSH_KEY`:

```bash
cat ~/.ssh/gh_actions_deploy
```

Docs:

* OpenSSH keys: [https://man.openbsd.org/ssh-keygen](https://man.openbsd.org/ssh-keygen)

### Workflow .github/workflows/deploy.yml

```yaml
name: Deploy

on:
  push:
    branches: [ "main" ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            set -e
            cd /var/www/app
            git pull origin main
            docker compose -f docker-compose.prod.yml up -d --build
            docker exec app_web php bin/console doctrine:migrations:migrate --no-interaction
            docker exec app_web bash -lc "chown -R www-data:www-data var && chmod -R 775 var"
```

Docs:

* appleboy ssh-action: [https://github.com/appleboy/ssh-action](https://github.com/appleboy/ssh-action)

### Problema comum: SSH handshake failed

Mensagem:

* `unable to authenticate`

Causas típicas:

* key no Secret colada incompleta
* `authorized_keys` sem a public key certa
* permissões erradas em `~/.ssh`
* usuário errado (root vs deploy)

Docs:

* SSH authorized_keys: [https://man.openbsd.org/sshd#AUTHORIZED_KEYS_FILE_FORMAT](https://man.openbsd.org/sshd#AUTHORIZED_KEYS_FILE_FORMAT)

### Problema comum: Host key verification

O runner do GitHub não tem `known_hosts`.
Solução mais robusta: fixar fingerprint do host no workflow (evita MITM). Você pode usar `ssh-keyscan` e configurar known_hosts antes de rodar deploy (ou usar opção de fingerprint do próprio action, se preferir).

Docs:

* known_hosts e keyscan: [https://man.openbsd.org/ssh-keyscan](https://man.openbsd.org/ssh-keyscan)

---

## 18) Melhorias para deixar o deploy “blindado” (sem derrubar site)

### 18.1 Evitar `down` no deploy

Use somente:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Isso reduz downtime (o container antigo pode ficar até o novo subir).

Docs:

* Compose up: [https://docs.docker.com/reference/cli/docker/compose/up/](https://docs.docker.com/reference/cli/docker/compose/up/)

### 18.2 Healthcheck

Adicione healthcheck para o app e DB, e só rode migrations após DB saudável.

Docs:

* healthcheck compose: [https://docs.docker.com/compose/compose-file/compose-file-v3/#healthcheck](https://docs.docker.com/compose/compose-file/compose-file-v3/#healthcheck)

### 18.3 Rollback

Guarde o SHA anterior e permita rollback via tag de imagem ou `git checkout`.

Docs:

* Git checkout deploy patterns: [https://git-scm.com/docs/git-checkout](https://git-scm.com/docs/git-checkout)

---

## 19) Checklist final de produção

### Infra

* [ ] DNS apontando
* [ ] Nginx com server_name correto
* [ ] SSL ativo e renovação funcionando

### Docker

* [ ] `docker compose up -d --build` sobe tudo
* [ ] Volumes persistem (`db_data`, `jwt_keys`)
* [ ] Sem portas do DB expostas

### App

* [ ] `.env` correto dentro do container (ou estratégia equivalente)
* [ ] Migrations ok
* [ ] JWT ok (sem bad decrypt)
* [ ] Permissões em `var/` ok (sem permission denied)
* [ ] Assets buildados em local correto (public/build ou equivalente)

### Deploy automático

* [ ] Secrets no GitHub
* [ ] SSH autenticando sem senha
* [ ] Workflow executa script sem falhas
* [ ] Log do deploy disponível nas Actions

---

## 20) Seção de troubleshooting (os “erros que mais aparecem”)

### A) `Could not open input file: ./bin/console` durante `composer install`

Causa: rodou `composer install` antes de copiar o projeto todo; scripts tentam usar bin/console.
Soluções:

* copiar projeto antes do composer
* ou `--no-scripts` no install

Docs:

* Composer scripts: [https://getcomposer.org/doc/articles/scripts.md](https://getcomposer.org/doc/articles/scripts.md)

### B) `COPY --from=frontend /app/dist ... not found`

Causa: Vite gera em `public/build` (ou outro), não `dist`.
Solução: copiar do path real do build.
Docs:

* Vite build: [https://vitejs.dev/guide/build.html](https://vitejs.dev/guide/build.html)

### C) `CORS error`

Causa: frontend chamando localhost em produção.
Solução: usar `/api` na mesma origem.
Docs:

* CORS MDN: [https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

### D) `SQLSTATE[HY000] [1045] Access denied`

Causa: user/pass diferente do que foi criado no primeiro boot do MySQL com volume persistente.
Solução:

* ajustar credenciais
* ou recriar volume em ambiente novo

Docs:

* MySQL image env: [https://hub.docker.com/_/mysql](https://hub.docker.com/_/mysql)

### E) `JWTEncodeFailureException bad decrypt`

Causa: passphrase diferente da usada na geração da private key.
Solução: regenerar keys com a passphrase correta e persistir em volume.

Docs:

* Lexik JWT: [https://symfony.com/bundles/LexikJWTAuthenticationBundle/current/index.html](https://symfony.com/bundles/LexikJWTAuthenticationBundle/current/index.html)

### F) `Permission denied` em `var/cache/prod`

Causa: `var/` com owner root.
Solução: limpar cache e chown para www-data.

Docs:

* Symfony permissions: [https://symfony.com/doc/current/setup/file_permissions.html](https://symfony.com/doc/current/setup/file_permissions.html)

---

## 21) Recomendação de padrão final (para não “apagar incêndio” todo deploy)

Se você quer que deploy automático seja confiável, recomendo:

1. No workflow, após `up -d --build`, rodar:

* migrations
* fix de permissão `var/`
* opcional: cache warmup

2. No Dockerfile, garantir `var/` sempre com owner correto.

3. Evitar misturar `.env.dev` e `.env` de produção no mesmo ambiente.

* VPS deve ter apenas o `.env` de produção real.

Docs:

* Symfony envs: [https://symfony.com/doc/current/configuration.html#configuration-based-on-environment-variables](https://symfony.com/doc/current/configuration.html#configuration-based-on-environment-variables)

---

## 22) Próximo nível (opcional, mas recomendado quando crescer)

* Build de imagem no GitHub → push em registry → VPS só faz pull
* Traefik em vez de Nginx manual
* Usuário `deploy` (sem root) e hardening SSH
* Observabilidade (logs centralizados)

Docs:

* GitHub Container Registry: [https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
* Docker registries: [https://docs.docker.com/docker-hub/](https://docs.docker.com/docker-hub/)

---

Se você quiser, eu posso te entregar também um “kit pronto” com:

* `docker-compose.prod.yml` robusto (healthcheck + restart strategy)
* `Dockerfile.prod` revisado (multi-stage + perms + cache)
* `.github/workflows/deploy.yml` com known_hosts/fingerprint e logs melhores
* script `deploy.sh` na VPS para padronizar comandos

Documentação principal usada como referência ao longo do tutorial:

* Docker/Compose: [https://docs.docker.com/](https://docs.docker.com/)
* Nginx reverse proxy: [https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
* Certbot: [https://certbot.eff.org/](https://certbot.eff.org/)
* Symfony deploy + env vars + permissions: [https://symfony.com/doc/current/](https://symfony.com/doc/current/)
* GitHub Actions secrets: [https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
* appleboy ssh-action: [https://github.com/appleboy/ssh-action](https://github.com/appleboy/ssh-action)
