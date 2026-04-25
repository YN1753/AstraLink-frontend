import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import pkg from './package.json';
// https://vitejs.dev/config/
export default defineConfig({
  define: {
    // 定义一个全局常量
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5175,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8181',
        changeOrigin: true,
      },
      '/data': {
        target: 'http://localhost:8181',
        changeOrigin: true,
      }
    }
  }
})