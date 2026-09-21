FROM php:8.4-fpm-alpine AS base
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Dependências do sistema
RUN apk add --no-cache \
    git bash libzip-dev icu-dev oniguruma-dev \
    && docker-php-ext-install pdo_mysql zip intl opcache

# --- Desenvolvimento ---
FROM base AS dev
ARG XDEBUG_VERSION=3.5.3
RUN apk add --no-cache $PHPIZE_DEPS linux-headers curl \
    && curl -4fsSL "https://github.com/xdebug/xdebug/archive/refs/tags/${XDEBUG_VERSION}.tar.gz" -o /tmp/xdebug.tar.gz \
    && mkdir -p /tmp/xdebug \
    && tar -xzf /tmp/xdebug.tar.gz -C /tmp/xdebug --strip-components=1 \
    && cd /tmp/xdebug \
    && phpize \
    && ./configure \
    && make \
    && make install \
    && cd / \
    && rm -rf /tmp/xdebug /tmp/xdebug.tar.gz \
    && docker-php-ext-enable xdebug

COPY devops/php/xdebug.ini /usr/local/etc/php/conf.d/xdebug.ini
COPY devops/php/php.dev.ini /usr/local/etc/php/conf.d/php.ini

COPY --chmod=755 devops/bootstrap.sh /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php-fpm"]
