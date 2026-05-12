# syntax=docker/dockerfile:1.7

# ── Etapa 1: compilar assets del frontend ─────────────────────────────────────
FROM node:22-alpine AS frontend

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Etapa 2: imagen PHP-FPM de producción ─────────────────────────────────────
FROM php:8.3-fpm-alpine

ENV COMPOSER_ALLOW_SUPERUSER=1

RUN apk add --no-cache \
    git curl zip unzip \
    postgresql-dev \
    libpng-dev freetype-dev libjpeg-turbo-dev \
    libxml2-dev oniguruma-dev icu-dev libzip-dev

RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
        pdo pdo_pgsql pgsql \
        mbstring exif pcntl bcmath gd intl xml zip opcache \
    && pecl install redis \
    && docker-php-ext-enable redis

COPY --from=composer:2.8 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY --chown=www-data:www-data . .
COPY --chown=www-data:www-data --from=frontend /app/public/build ./public/build

RUN composer install \
    --optimize-autoloader \
    --no-dev \
    --no-interaction \
    --no-ansi

RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY docker/php/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 9000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["php-fpm"]
