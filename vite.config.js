import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

export default defineConfig({
  base: './',                          // обязательно для WebView (file:// или app://)
  plugins: [vue()],
  build: {
    outDir: 'www',                     // Cordova берёт файлы отсюда
    assetsDir: 'assets',
    target: 'es2018',                  // стабильно для iOS 13+
    sourcemap: false,
  },
  server: {
    // proxy работает ТОЛЬКО в режиме dev (vite dev). В собранном приложении не действует.
    proxy: {
      '/api': {
        target: 'https://api.daigo.ru',
        changeOrigin: true,
        secure: false,
        rewrite: p => p.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js',
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
