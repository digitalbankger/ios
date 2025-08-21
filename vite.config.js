import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';

export default defineConfig({
  base: './',
  plugins: [
    vue(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.daigo.ru',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => {
          console.log("Rewriting path:", path);
          return path.replace(/^\/api/, '');
        },
      },
    },
  },
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js',
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
