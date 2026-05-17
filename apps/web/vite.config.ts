import { tanstackRouter } from '@tanstack/router-plugin/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const base = '/';

export default defineConfig({
  base,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3001,
    strictPort: true,
  },
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    VitePWA({
      base,
      scope: base,
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'pwa.svg'],
      manifest: {
        name: 'Bagyo Rescue',
        short_name: 'Bagyo Rescue',
        description:
          'Tulong sa bagyo, kahit walang signal. Offline-ready typhoon rescue requests and coordination.',
        lang: 'tl',
        // Resolved from --color-rescue-600 (oklch(0.52 0.205 260)).
        theme_color: '#1956C5',
        // Resolved from --color-bg (slate-50, oklch(0.985 0.003 248)).
        background_color: '#F8FAFB',
        display: 'standalone',
        start_url: base,
        scope: base,
        // TODO: replace pwa.svg with a true maskable icon (512×512 PNG with
        // safe-zone padding) and a separate non-maskable variant.
        icons: [
          {
            src: 'pwa.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: `${base}index.html`,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'bagyo-rescue-pages',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 20,
              },
            },
          },
          {
            urlPattern: ({ request }) =>
              ['script', 'style', 'worker'].includes(request.destination),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'bagyo-rescue-assets',
              expiration: {
                maxEntries: 60,
              },
            },
          },
        ],
      },
    }),
  ],
});
