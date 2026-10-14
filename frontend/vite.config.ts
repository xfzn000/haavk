import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      // 真实后端联调时：/api -> Spring Boot(8080)
      '/api': {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      // 后台上传的图片走 /uploads/**（磁盘静态资源），开发服务器也要代理，否则上传的图在前端 404
      '/uploads': {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    /**
     * 不自动清空 dist。
     * 原因：本机构建时的删除会走「安全删除」→ 进系统回收站，每次构建都往回收站里
     * 丢 ~57 个哈希命名的分片（几千个文件堆积，用户明确要求停止）。
     * 关掉后 dist 会残留旧哈希文件 —— 不影响运行（index.html 只引用当次产出的名字），
     * dist 也已在 .gitignore 里。需要彻底清理时由用户手动删除整个 dist 即可。
     */
    emptyOutDir: false,
    chunkSizeWarningLimit: 1200,
  },
})
