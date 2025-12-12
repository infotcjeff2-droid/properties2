import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { join } from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-404',
      closeBundle() {
        copyFileSync(
          join(__dirname, 'public', '404.html'),
          join(__dirname, 'dist', '404.html')
        )
        // Copy favicon to dist
        const { existsSync, mkdirSync } = require('fs')
        const imgDir = join(__dirname, 'dist', 'img')
        if (!existsSync(imgDir)) {
          mkdirSync(imgDir, { recursive: true })
        }
        copyFileSync(
          join(__dirname, 'src', 'img', 'ZXS website logo.png'),
          join(imgDir, 'ZXS website logo.png')
        )
      }
    }
  ],
  base: '/ZXS-order-form/',
  server: {
    port: 3000,
    open: true
  },
  publicDir: 'public'
})

