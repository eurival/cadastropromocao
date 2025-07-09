import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
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
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'certs/localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'certs/localhost.pem'))
    },
    proxy: {
      '/api': {
        target: 'https://cinexapi.ingressocinex.com.br',
        changeOrigin: true, // Essencial para o servidor de destino não rejeitar a requisição
        secure: false, // Pode ser necessário se o destino tiver certificados auto-assinados (não parece ser o caso aqui, mas é uma boa prática em dev)
     //   rewrite: (path) => path.replace(/^\/api/, '') // Remove o '/api' antes de enviar para o servidor de destino
      }
    }
  }
});
