# syntax=docker/dockerfile:1.7

# ── Etapa base: extensiones PHP compartidas ───────────────────────────────────
FROM php:8.3-fpm-alpine AS php-base

RUN apk add --no-cache \
    git curl zip unzip autoconf g++ make \
    postgresql-dev \
    libpng-dev freetype-dev libjpeg-turbo-dev \
    libxml2-dev oniguruma-dev icu-dev libzip-dev

RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
        pdo pdo_pgsql pgsql \
        mbstring exif pcntl bcmath gd intl xml zip opcache \
    && pecl install redis \
    && docker-php-ext-enable redis

# ── Etapa de compilación: PHP + Node (Wayfinder necesita PHP en npm run build) ─
FROM php-base AS builder

ENV COMPOSER_ALLOW_SUPERUSER=1

RUN apk add --no-cache nodejs npm

COPY --from=composer:2.8 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN mkdir -p bootstrap/cache

# APP_KEY temporal para que artisan pueda bootstrapear durante la generación de tipos
ARG APP_KEY=base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=
ENV APP_KEY=${APP_KEY}

RUN composer install \
    --optimize-autoloader \
    --no-dev \
    --no-interaction \
    --no-ansi

RUN npm ci && npm run build

# ── Etapa de producción: PHP-FPM ──────────────────────────────────────────────
FROM php-base

ENV COMPOSER_ALLOW_SUPERUSER=1

COPY --from=composer:2.8 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY --chown=www-data:www-data . .
COPY --chown=www-data:www-data --from=builder /var/www/html/vendor ./vendor
COPY --chown=www-data:www-data --from=builder /var/www/html/public/build ./public/build
COPY --chown=www-data:www-data --from=builder /var/www/html/bootstrap/cache ./bootstrap/cache

RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY docker/php/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 9000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["php-fpm"]
