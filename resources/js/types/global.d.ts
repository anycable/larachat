import type { route as routeFn } from 'ziggy-js';
import type Echo from 'laravel-echo';
import type Pusher from 'pusher-js';

declare global {
    const route: typeof routeFn;
    interface Window {
        Echo: Echo;
        Pusher: typeof Pusher;
    }
}
