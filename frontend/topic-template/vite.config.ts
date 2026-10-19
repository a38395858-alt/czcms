import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
const root = path.dirname(fileURLToPath(import.meta.url));
export default defineConfig(({ isSsrBuild }) => ({
  base: '/assets/freightvanta-topic-v18/',
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(root, 'src') } },
  build: { manifest: true, outDir: 'dist', emptyOutDir: true, rollupOptions: { output: {
    entryFileNames: isSsrBuild ? 'assets/topic.js' : 'assets/topic-[hash].js', chunkFileNames: 'assets/[name]-[hash].js',
    assetFileNames: info => info.name?.endsWith('.css') ? 'assets/topic.css' : 'assets/[name]-[hash][extname]',
  } } },
}));
