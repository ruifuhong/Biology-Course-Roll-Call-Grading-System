import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
  test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: ['./src/test/setup.js'],
  coverage: {
    provider: 'v8',
    reporter: ['text', 'html'],
    reportsDirectory: './coverage',
    include: [
      'src/utils/semesterUtils.js',
      'src/components/AdminDashboard.jsx',
      'src/components/SessionManagement.jsx'
  ],
    exclude: [
      'node_modules/**',
      'src/__tests__/**',
      'src/**/*.test.*',
      'src/**/*.spec.*',
      'src/main.jsx'
    ],
    all: false,
    clean: true,
    enabled: true, 
    allowExternal: true,
  },
},
})
