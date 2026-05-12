#!/bin/sh
set -e

echo ">>> Esperando a PostgreSQL..."
until php -r "
    try {
        new PDO(
            'pgsql:host=${DB_HOST};port=${DB_PORT:-5432};dbname=${DB_DATABASE}',
            '${DB_USERNAME}',
            '${DB_PASSWORD}'
        );
        exit(0);
    } catch (Exception \$e) {
        exit(1);
    }
" 2>/dev/null; do
    sleep 2
done
echo ">>> PostgreSQL listo."

# El worker de colas solo espera la DB y arranca — las migraciones las corre app.
if [ "$1" = "php-fpm" ]; then
    echo ">>> Ejecutando migraciones..."
    php artisan migrate --force --no-interaction

    echo ">>> Enlazando storage..."
    php artisan storage:link --force 2>/dev/null || true

    echo ">>> Cacheando configuración..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
fi

exec "$@"
