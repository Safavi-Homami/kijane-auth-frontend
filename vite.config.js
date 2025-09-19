// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';              // ✅ NEU: Tailwind v4 Plugin
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react(), tailwind()],                      // ✅ NEU: Plugin aktivieren

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),           // Basis-Alias
      '@api': path.resolve(__dirname, './src/api.js'), // dein api.js Alias
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },

  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // behalte dein Rewrite exakt bei
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
});
