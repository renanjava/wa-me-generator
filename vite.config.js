import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: 'public', 
  envDir: '../',   // <--- Adicione isto: faz o Vite buscar o .env na raiz do projeto
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  server: {
    port: 3000
  }
});
