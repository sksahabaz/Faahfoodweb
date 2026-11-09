import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Where the Java backend runs during development (Tomcat from Eclipse).
  // Override in frontend/.env.local with BACKEND_URL=...
  const backend = env.BACKEND_URL || 'http://localhost:8080/Faahfoodweb'

  const toBackend = {
    target: backend,
    changeOrigin: true,
    // Tomcat sets the session cookie on /Faahfoodweb; rewrite it to /
    // so the browser sends it back to the Vite dev server.
    cookiePathRewrite: { '*': '/' },
  }

  return {
    // Relative asset URLs in the build: the same dist works at Tomcat's ROOT context ("/")
    // and under a context path ("/Faahfoodweb/"). Runtime URLs come from src/lib/paths.js.
    base: command === 'build' ? './' : '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': toBackend,
        '/images': toBackend,
      },
    },
    build: {
      // three.js + React Three Fiber are one large chunk, loaded lazily by the homepage.
      chunkSizeWarningLimit: 1600,
    },
  }
})
