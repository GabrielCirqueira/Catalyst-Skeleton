FROM php:8.4-fpm-alpine AS base
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Dependências do sistema (incluindo o que é necessário para extensões PHP)
RUN apk add --no-cache \
    git bash libzip-dev icu-dev oniguruma-dev \
    && docker-php-ext-install pdo_mysql zip intl opcache

# --- Estágio de desenvolvimento ---
FROM base AS dev
RUN apk add --no-cache $PHPIZE_DEPS linux-headers \
    && pecl install xdebug \
    && docker-php-ext-enable xdebug

# Configurações de dev
COPY docker/php/xdebug.ini /usr/local/etc/php/conf.d/xdebug.ini
COPY docker/php/php.dev.ini /usr/local/etc/php/conf.d/php.ini

# bootstrap.sh garante JWT keys, permissões e migrations no startup
COPY --chmod=755 docker/bootstrap.sh /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php-fpm"]

# --- Builder: instala dependências sem dev ---
FROM base AS builder

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --optimize-autoloader --no-interaction

COPY . .
RUN composer dump-autoload --optimize

# --- Estágio de produção: imagem final enxuta ---
FROM base AS prod
WORKDIR /var/www

# Configurações de prod
COPY docker/php/php.prod.ini /usr/local/etc/php/conf.d/php.ini

# Ajusta permissões e segurança
COPY --from=builder --chown=www-data:www-data /app /var/www

RUN mkdir -p /var/www/var/cache /var/www/var/log \
    && chown -R www-data:www-data /var/www/var

COPY --chmod=755 docker/bootstrap.sh /usr/local/bin/entrypoint.sh

USER www-data

# Expondo porta padrão da FPM
EXPOSE 9000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php-fpm"]
