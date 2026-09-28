/// <reference types="vitest/config" />
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    rollupOptions: {
      output: {
        // Bibliotecas grandes em arquivos próprios: mudam pouco, ficam em cache.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/[/\\](react|react-dom|scheduler|react-router|react-router-dom|@remix-run)[/\\]/.test(id)) return 'react'
          if (id.includes('@supabase')) return 'supabase'
          if (id.includes('@radix-ui')) return 'radix'
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
