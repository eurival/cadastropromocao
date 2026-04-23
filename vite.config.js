import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Deriva __dirname em ESM
const __dirname = path.dirname(new URL(import.meta.url).pathname);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  css: {
    postcss: path.resolve(__dirname, 'postcss.config.js')
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://cinexapi.ingressocinex.com.br',
        changeOrigin: true, // Essencial para o servidor de destino não rejeitar a requisição
        secure: false,
      }
    }
  }
});
