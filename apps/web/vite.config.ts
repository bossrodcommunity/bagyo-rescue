import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

function normalizeBasePath(value: string | undefined) {
  if (!value) {
    return '/';
  }

  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = normalizeBasePath(env.VITE_BASE_PATH);

  return {
    base,
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
      VitePWA({
        base,
        scope: base,
        registerType: 'prompt',
        injectRegister: false,
        includeAssets: ['favicon.svg', 'pwa.svg'],
        manifest: {
          name: 'Bagyo Rescue',
          short_name: 'Bagyo Rescue',
          description: 'Offline-ready rescue reports and coordination dashboard.',
          theme_color: '#0f766e',
          background_color: '#f8fafc',
          display: 'standalone',
          start_url: base,
          scope: base,
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
          skipWaiting: false,
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
  };
});
