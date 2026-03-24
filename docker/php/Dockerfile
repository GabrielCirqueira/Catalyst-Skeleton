FROM php:8.4-fpm-alpine AS base
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Dependências do sistema
RUN apk add --no-cache \
    git bash libzip-dev icu-dev oniguruma-dev \
    && docker-php-ext-install pdo_mysql zip intl opcache

# --- Desenvolvimento ---
FROM base AS dev
RUN apk add --no-cache $PHPIZE_DEPS linux-headers \
    && (pecl install xdebug || pecl install xdebug || pecl install xdebug) \
    && docker-php-ext-enable xdebug

COPY docker/php/xdebug.ini /usr/local/etc/php/conf.d/xdebug.ini
COPY docker/php/php.dev.ini /usr/local/etc/php/conf.d/php.ini

COPY --chmod=755 docker/bootstrap.sh /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php-fpm"]
