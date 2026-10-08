import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const portValue = env.APP_PORT === 'undefined' ? env.PORT : env.APP_PORT || env.PORT;
  const parsedPort = Number(portValue);
  const port = Number.isInteger(parsedPort) && parsedPort > 0 && parsedPort <= 65535
    ? parsedPort
    : 5173;

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: env.APP_HOST || 'localhost',
      port,
    },
    define: {
      'DELCOM_BASEURL': JSON.stringify(
        env.VITE_DELCOM_BASEURL || env.DELCOM_BASEURL || 'https://open-api.delcom.org/api/v1'
      )
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/setupTests.js',
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{js,jsx}'],
        exclude: [
          'src/main.jsx',
          'src/setupTests.js',
          'src/test/**',
          'src/**/*.test.{js,jsx}',
        ],
        reporter: ['text', 'html'],
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
