import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [],
  css: {
    transformer: 'postcss'
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://exe201-ezbuildvn-be.onrender.com',
        changeOrigin: true,
        secure: true,
        // giữ nguyên path /api -> /api ở backend (Spring đang dùng prefix /api)
        // nếu backend không có prefix /api, thêm: rewrite: (p) => p.replace(/^\/api/, '')
      },
    },
  },
})
