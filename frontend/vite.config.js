import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
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
  }
})
