import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';
import removeConsole from "vite-plugin-remove-console";
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/',
  preview: {
    port: 3000,
    strictPort: true,
  },
  server: {
    host: 'localhost',
    port: 3000,
    strictPort: true,
  },

  plugins: [
    react({
      plugins: [
        [
          '@swc/plugin-styled-components',
          {
            displayName: true,
            pure: true,
            ssr: false,
          }
        ]
      ]
    }),
    removeConsole({
      includes: ["log", "warn", "error", "debug"],
    }),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      strategies: 'generateSW',
      manifest: {
        name: 'CDAC Bangalore - Inscription Analyzer',
        short_name: 'CDAC Inscriptions',
        description: 'A Progressive Web App for analyzing and viewing historical inscriptions',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait-primary',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,jpg,jpeg,gif,webp,woff,woff2,ttf,eot}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
            },
          },
          {
            urlPattern: /^https:\/\/cdn\.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
      navigateFallback: '/index.html',
      navigateFallbackDenylist: [/^\/api\//, /^\/detect\//, /^\/metrics$/, /^\/n8n$/],
      devOptions: {
        enabled: true,
        navigateFallback: 'index.html',
        suppressWarnings: true,
      },
    }),
  ],

  css: {
    modules: {
      localsConvention: 'camelCase',
    }
  },

  resolve: {
    alias: {
      '@mui/styled-engine': '@mui/styled-engine-sc',

      '@': path.resolve(__dirname, './src'),
      '@api': path.resolve(__dirname, './src/api'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@components': path.resolve(__dirname, './src/components'),
      '@context': path.resolve(__dirname, './src/context'),
      '@db': path.resolve(__dirname, './src/db'),
      '@features': path.resolve(__dirname, './src/features'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@layouts': path.resolve(__dirname, './src/layouts'),
      '@routes': path.resolve(__dirname, './src/routes'),
      '@services': path.resolve(__dirname, './src/services'),
      '@store': path.resolve(__dirname, './src/store'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@views': path.resolve(__dirname, './src/views'),
    },
  },
});
