## Laravel Chat Demo

A minimal real-time chat application built with Laravel that can use either [Laravel Reverb](https://laravel.com/docs/reverb) or [AnyCable](https://anycable.io) for WebSocket broadcasting.

> This project started as an AI-generated fork of our [Next.js demo](https://github.com/anycable/anycable-pubsub-nextjs).

Features real-time messaging with session-based usernames and message persistence.

This project is configured for easy deployment to [Fly.io](https://fly.io).

### Running locally

First, install PHP dependencies:

```sh
composer install
```

Install Node.js dependencies:

```sh
npm install
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

The default command runs a Laravel Reverb WebSocket server. You can also run this app using AnyCable as a WebSocket server:

```sh
composer run dev:anycable
```

The only difference is the server command: `php artisan anycable:server` instead of `php artisan reverb:start`. The `anycable:server` command is provided by the [anycable-laravel][] package. But there is more.

You can also go AnyCable _full mode_ (and not just Pusher compatibility) and switch the broadcaster to "anycable". In your `.env` file:

```
BROADCAST_CONNECTION=anycable
```

Now, launch the app using the same `composer run dev:anycable` command and you'll see it _speaking_ AnyCable (if you open your browser DevTools). This gives you all the AnyCable features such as [reliable streams](https://docs.anycable.io/anycable-go/reliable_streams) and more.

### What's included

- Real-time chat messaging with Laravel Reverb w/ typing indicators and presence info
- Session-based username system
- Message persistence with SQLite
- React frontend with Inertia.js
- Tailwind CSS for styling
- Fly.io deployment configuration

[anycable-laravel]: https://github.com/anycable/anycable-laravel
