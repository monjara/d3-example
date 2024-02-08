import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react({
    jsxImportSource: '@emotion/react'
  })],
  root: 'src',
  server: {
    port: 8080,
    host: true
  },
  build: {
    outDir: '../build'
  },
  envDir: '../',
  resolve: {
    alias: {
      './runtimeConfig': './runtimeConfig.browser',
    }
  },
  define: {
  },
})

