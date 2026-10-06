import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: env.APP_PORT ? parseInt(env.APP_PORT) : 5173,
    },
    define: {
      'DELCOM_BASEURL': JSON.stringify(env.DELCOM_BASEURL || 'https://open-api.delcom.org/api/v1')
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/setupTests.js',
      coverage: {
        thresholds: {
          lines: 70,
          functions: 70,
          branches: 70,
          statements: 70
        }
      }
    }
  }
})
