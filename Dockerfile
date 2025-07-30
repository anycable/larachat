# syntax=docker/dockerfile:1.4

ARG PHP_VERSION=8.2
ARG NODE_VERSION=20

FROM fideloper/fly-laravel:${PHP_VERSION} AS base
LABEL fly_launch_runtime="laravel"
ARG PHP_VERSION

RUN set -eux; \
    apt-get update -q && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        git \
        unzip \
        curl \
        wget \
        supervisor \
        php${PHP_VERSION}-fpm \
        php${PHP_VERSION}-curl \
        php${PHP_VERSION}-xml \
        php${PHP_VERSION}-mbstring \
        php${PHP_VERSION}-intl \
        php${PHP_VERSION}-sqlite3 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /var/www/html

COPY composer.json composer.lock ./

# Install PHP dependencies
RUN composer install \
    --no-dev \
    --prefer-dist \
    --optimize-autoloader \
    --no-interaction \
    --no-scripts \
    --no-cache

FROM node:${NODE_VERSION}-slim AS node-build

# Build arguments for Vite
ARG REVERB_APP_KEY
ARG REVERB_HOST
ARG REVERB_PORT
ARG REVERB_SCHEME

# Set environment variables for build
ENV NODE_ENV=production
ENV REVERB_APP_KEY=${REVERB_APP_KEY}
ENV REVERB_HOST=${REVERB_HOST}
ENV REVERB_PORT=${REVERB_PORT}
ENV REVERB_SCHEME=${REVERB_SCHEME}

WORKDIR /app

# Copy package files for better caching
COPY package*.json vite.config.* ./
# Install Node.js dependencies
RUN npm ci --only=production --no-audit --no-fund

# Copy source files and build
COPY resources resources
COPY public public

# Build assets
RUN npm run build && \
    npm cache clean --force

FROM base AS runtime

# Copy built assets from Node.js stage
COPY --from=node-build /app/public/build public/build

COPY . .

# Create necessary directories and set permissions
RUN mkdir -p /var/www/html/database \
            /var/www/html/storage/{app/public,framework/{cache,sessions,views},logs} \
 && chown -R www-data:www-data /var/www/html  \
 && chmod -R 755 /var/www/html/storage /var/www/html/bootstrap/cache

RUN composer dump-autoload --optimize --no-dev --classmap-authoritative && \
    php artisan storage:link && \
    php artisan package:discover --ansi

COPY .fly/entrypoint.sh /entrypoint
RUN chmod +x /entrypoint

COPY .fly/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY .fly/nginx.conf /etc/nginx/http.d/default.conf

EXPOSE 8080

CMD ["/entrypoint.sh"]
