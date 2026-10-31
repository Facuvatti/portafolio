import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import contenido from './plugins/contenido.js'

export default defineConfig({
  // GitHub Pages publica el sitio en facuvatti.github.io/portafolio/
  base: '/portafolio/',
  plugins: [react(), contenido()],
  // node_modules puede ser un enlace a otro disco: en NTFS no cargan los binarios nativos.
  server: { fs: { strict: false } },
  build: { chunkSizeWarningLimit: 1000 },
})
