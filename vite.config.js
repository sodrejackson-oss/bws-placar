import { defineConfig } from 'vite';

export default defineConfig({
  // caminhos relativos: o build roda em qualquer pasta ou hospedagem
  base: './',
  build: { chunkSizeWarningLimit: 800 },
});
