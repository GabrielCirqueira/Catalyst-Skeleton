FROM php:8.4-apache

# Instalar extensões PHP e pacotes necessários
RUN apt-get update && apt-get install -y \
    git unzip libicu-dev libpq-dev libzip-dev zip curl \
    supervisor cron \
 && docker-php-ext-install pdo pdo_mysql intl opcache \
 && a2enmod rewrite headers

# Instalar Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Configurar diretório de trabalho
WORKDIR /var/www/html

RUN git config --global --add safe.directory /var/www/html

# Copiar arquivos do projeto
COPY . .

# Garantir permissões de execução em scripts necessários
RUN chmod +x docker/bootstrap.sh

# Instalar dependências PHP (sem rodar scripts para evitar cache:clear durante build)
RUN APP_ENV=test composer install --no-interaction --optimize-autoloader --no-scripts

# Permissões para cache/logs
RUN mkdir -p var/cache var/log \
    && chown -R www-data:www-data var

# Scripts auxiliares
COPY wait-for-db.sh /usr/local/bin/wait-for-db.sh
RUN chmod +x /usr/local/bin/wait-for-db.sh

# Diretório para as chaves JWT
RUN mkdir -p config/jwt

# Gerar as chaves automaticamente (senha fixa "jwtpass")
RUN openssl genrsa -aes256 -passout pass:jwtpass -out config/jwt/private.pem 4096 \
    && openssl rsa -pubout -in config/jwt/private.pem -passin pass:jwtpass -out config/jwt/public.pem \
    && chmod 644 config/jwt/*.pem

# Copiar config do Apache com Rewrite e Authorization
COPY docker/apache/000-default.conf /etc/apache2/sites-available/000-default.conf

# Ativar mod_rewrite e mod_headers
RUN a2enmod rewrite headers

COPY docker/crontab /etc/cron.d/my-cron
RUN chmod 0644 /etc/cron.d/my-cron && crontab /etc/cron.d/my-cron && mkdir -p /var/log/cron

# Apache expõe na porta 80
# Supervisord configuration
COPY supervisord.conf /etc/supervisor/supervisord.conf

EXPOSE 80 9001

CMD ["bash", "-lc", "/usr/local/bin/wait-for-db.sh database true && bash /var/www/html/docker/bootstrap.sh && exec /usr/bin/supervisord -n"]
