// Convert Vite configuration to CommonJS so it works when the project
// is treated as a CommonJS package (package.json sets "type" to
// "commonjs").  Using ESM imports in a `.js` file when Node expects
// CommonJS causes a `module is not defined` error during the build.

const { defineConfig } = require('vite')
const vue = require('@vitejs/plugin-vue')
const path = require('node:path')

module.exports = defineConfig({
  // Base URL must be relative for Cordova's file:// or app:// scheme
  base: './',
  plugins: [vue()],
  build: {
    outDir: 'www', // Cordova reads compiled files from www/
    assetsDir: 'assets',
    target: 'es2018',
    sourcemap: false,
  },
  server: {
    // Proxy configuration only applies during local development (vite dev).
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
