import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
    },
    define: {
        'import.meta.env.VITE_REVERB_APP_KEY': JSON.stringify(process.env.REVERB_APP_KEY || 'reverb_key'),
        'import.meta.env.VITE_REVERB_HOST': JSON.stringify(process.env.REVERB_HOST || 'localhost'),
        'import.meta.env.VITE_REVERB_PORT': JSON.stringify(process.env.REVERB_PORT || '8080'),
        'import.meta.env.VITE_REVERB_SCHEME': JSON.stringify(process.env.REVERB_SCHEME || 'http'),
    },
});
