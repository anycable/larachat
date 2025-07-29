import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { EchoCable } from '@anycable/echo';

// Allow connecting to a WebSocket server through toxiproxy to emulate
// unstable network
const urlParams = new URLSearchParams(window.location.search);
const port = urlParams.get('port') | 0;

// Configure Echo
if (import.meta.env.VITE_BROADCAST_CONNECTION === 'anycable') {
    window.Echo = new Echo({
        broadcaster: EchoCable,
        cableOptions: {
            url: import.meta.env.VITE_WEBSOCKET_URL || `ws://localhost:${port | 8080}/cable`,
        },
        auth: {
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
        },
    });
} else {
    window.Pusher = Pusher;
    window.Echo = new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY || 'reverb_key',
        wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
        wsPort: port || 8080,
        wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
        forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
        enabledTransports: ['ws', 'wss'],
        auth: {
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
        },
    });
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
