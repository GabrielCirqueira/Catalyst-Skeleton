FROM php:8.4-apache

# ── Sistema e extensões PHP ───────────────────────────────────────────────────
RUN apt-get update && apt-get install -y \
    git unzip libicu-dev libzip-dev zip curl \
    supervisor cron \
 && docker-php-ext-install pdo pdo_mysql intl opcache zip \
 && a2enmod rewrite headers \
 && rm -rf /var/lib/apt/lists/*

# ── Node.js (instalado aqui para ser reutilizado no cache) ───────────────────
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# ── Composer ─────────────────────────────────────────────────────────────────
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# ── Camada 1: dependências PHP (invalida só quando composer.json/lock muda) ──
COPY composer.json composer.lock ./
RUN APP_ENV=prod composer install \
    --no-dev \
    --optimize-autoloader \
    --no-interaction \
    --no-scripts

# ── Camada 2: dependências JS (invalida só quando package.json/lock muda) ────
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# ── Camada 3: código da aplicação (invalida em todo commit) ──────────────────
COPY . .

# Build arg injetado pelo docker-compose.prod.yml
ARG VITE_API_BASE_URL=http://localhost
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# ── Build do frontend ─────────────────────────────────────────────────────────
RUN npm run build \
    && rm -rf node_modules /root/.npm

# ── Remove Node.js (não necessário em runtime) ────────────────────────────────
RUN apt-get purge -y nodejs npm \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

# ── Scripts auxiliares ────────────────────────────────────────────────────────
RUN chmod +x docker/bootstrap.sh
COPY wait-for-db.sh /usr/local/bin/wait-for-db.sh
RUN chmod +x /usr/local/bin/wait-for-db.sh

# ── Permissões ────────────────────────────────────────────────────────────────
RUN mkdir -p var/cache var/log config/jwt \
    && chown -R www-data:www-data var

# ── OPcache para prod ─────────────────────────────────────────────────────────
COPY docker/prod/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

# ── Apache ────────────────────────────────────────────────────────────────────
COPY docker/apache/000-default.conf /etc/apache2/sites-available/000-default.conf

# ── Cron ─────────────────────────────────────────────────────────────────────
COPY docker/crontab /etc/cron.d/my-cron
RUN chmod 0644 /etc/cron.d/my-cron && crontab /etc/cron.d/my-cron && mkdir -p /var/log/cron

# ── Supervisor ────────────────────────────────────────────────────────────────
COPY supervisord.conf /etc/supervisor/supervisord.conf

RUN git config --global --add safe.directory /var/www/html

EXPOSE 80 9001

CMD ["bash", "-lc", "/usr/local/bin/wait-for-db.sh database true && bash /var/www/html/docker/bootstrap.sh && exec /usr/bin/supervisord -n"]
