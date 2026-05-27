# syntax=docker/dockerfile:1

ARG PHP_VERSION=8.2
ARG DISTRO_NAME=bookworm

FROM php:${PHP_VERSION}-cli-${DISTRO_NAME}

ARG DISTRO_NAME

# System dependencies for PHP development, Node.js, and tooling.
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    rm -f /etc/apt/apt.conf.d/docker-clean; \
    echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' > /etc/apt/apt.conf.d/keep-cache; \
    apt-get update -qq && \
    DEBIAN_FRONTEND=noninteractive apt-get install -yq --no-install-recommends \
      build-essential \
      ca-certificates \
      curl \
      git \
      less \
      libsqlite3-dev \
      libzip-dev \
      procps \
      unzip \
      bubblewrap \
      vim \
      bash-completion

# PHP extensions.
RUN docker-php-ext-install pcntl pdo_sqlite zip
RUN pecl install redis && docker-php-ext-enable redis

# Composer (from official image).
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Node.js 22 via NodeSource.
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y --no-install-recommends nodejs

# Claude CLI (used by `dip claude`).
RUN curl -fsSL https://claude.ai/install.sh | bash
ENV PATH=/root/.local/bin:${PATH}
ENV IS_SANDBOX=1

COPY .bashrc /root/.bashrc

WORKDIR /app

EXPOSE 8000 5173 8080

CMD ["/bin/bash"]
