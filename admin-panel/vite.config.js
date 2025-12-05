import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-widget',
      configureServer(server) {
        server.middlewares.use('/widget.js', (req, res) => {
          try {
            const widgetPath = resolve(__dirname, 'public/widget.js')
            const content = readFileSync(widgetPath, 'utf-8')
            res.setHeader('Content-Type', 'application/javascript')
            res.end(content)
          } catch (e) {
            console.error('Widget serve error:', e)
            res.statusCode = 404
            res.end('Widget not found: ' + e.message)
          }
        })
      }
    }
  ],
  publicDir: 'public',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
