import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // hashed files only; public/assets is unhashed and must not get the immutable header (vercel.json)
  build: { assetsDir: '_app' },
})
