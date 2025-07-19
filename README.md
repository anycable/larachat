## Laravel Chat Demo

A minimal real-time chat application built with Laravel and [Laravel Reverb](https://laravel.com/docs/reverb) for WebSocket broadcasting.

> This project started as an AI-generated fork of our [Next.js demo](https://github.com/anycable/anycable-pubsub-nextjs).

Features real-time messaging with session-based usernames and message persistence.

### Running locally

First, install PHP dependencies:

```sh
composer install
```

Install Node.js dependencies:

```sh
npm install
```

Copy the environment file and generate application key:

```sh
cp .env.example .env
php artisan key:generate
```

Create the database and run migrations:

```sh
touch database/database.sqlite
php artisan migrate
```

Start the development server (includes Laravel server, Reverb WebSocket server, Vite, and background processes):

```sh
composer run dev
```

You can open the app in your browser at [http://localhost:8000](http://localhost:8000).

### What's included

- Real-time chat messaging with Laravel Reverb
- Session-based username system
- Message persistence with SQLite
- React frontend with Inertia.js
- Tailwind CSS for styling
