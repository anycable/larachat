#!/usr/bin/env bash
set -e

if [[ "$DB_CONNECTION" == "sqlite" ]]; then
  mkdir -p "$(dirname "$DB_DATABASE")"
  [[ -f "$DB_DATABASE" ]] || touch "$DB_DATABASE"
fi

php artisan migrate --force

php artisan config:clear && php artisan config:cache
php artisan route:cache && php artisan event:cache

exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
