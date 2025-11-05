import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [ tailwindcss()],
  css: {
    // Force Vite to use PostCSS instead of Lightning CSS native bindings
    transformer: 'postcss'
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // giữ nguyên path /api -> /api ở backend (Spring đang dùng prefix /api)
        // nếu backend không có prefix /api, thêm: rewrite: (p) => p.replace(/^\/api/, '')
      },
    },
  },
})
