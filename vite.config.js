import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import contenido from './plugins/contenido.js'

export default defineConfig({
  // GitHub Pages lo publica en la raíz de facundovattino.dev.ar
  base: '/',
  plugins: [react(), contenido()],
  // node_modules puede ser un enlace a otro disco: en NTFS no cargan los binarios nativos.
  server: { fs: { strict: false } },
  build: { chunkSizeWarningLimit: 1000 },
})
