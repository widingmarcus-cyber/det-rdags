import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/widget.jsx',
      name: 'Bobot',
      fileName: 'widget',
      formats: ['iife']
    },
    rollupOptions: {
      output: {
        extend: true
      }
    }
  },
  server: {
    port: 3001
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  }
})
