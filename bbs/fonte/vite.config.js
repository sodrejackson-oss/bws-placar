// Gera bbs/js/camisa3d.js (com o Three.js embutido) a partir de bbs/fonte/camisa3d.js.
// Rode na raiz do repositório: npx vite build --config bbs/fonte/vite.config.js
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  publicDir: false,
  build: {
    lib: { entry: fileURLToPath(new URL('./camisa3d.js', import.meta.url)), formats: ['es'], fileName: () => 'camisa3d.js' },
    outDir: fileURLToPath(new URL('../js', import.meta.url)),
    emptyOutDir: false,
    minify: true,
  },
});
