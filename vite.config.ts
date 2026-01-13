import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

// Plugin to inject CSP nonce placeholder
function cspNoncePlugin(): Plugin {
  return {
    name: 'csp-nonce-plugin',
    transformIndexHtml(html) {
      // Add meta tag placeholder for nonce (use `name` to match nginx sub_filter)
      return html.replace(
        '<head>',
        `<head>\n    <meta name="csp-nonce" content="\${csp_nonce}">`
      );
    }
  };
}

export default defineConfig({
  base: '/',
  preview: {
    port: 3000,
    strictPort: true,
  },
  server: {
    host: 'localhost',
    port: 3000,
<<<<<<< HEAD
    strictPort: true,
=======
    strictPort: true,      
>>>>>>> 2fe486c (csp issues)
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
    tailwindcss(),
<<<<<<< HEAD
=======
    cspNoncePlugin()
>>>>>>> 2fe486c (csp issues)
  ],

  css: {
    modules: {
      localsConvention: 'camelCase',
    }
  },

  resolve: {
    alias: {
      // 🔴 REQUIRED FOR MUI + styled-components
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
