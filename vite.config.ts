import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  build: { rollupOptions: {} },
  // @ts-ignore — Vite 8 flag to opt out of Rolldown and use Rollup
  experimental: { enableNativePlugin: false },
})
