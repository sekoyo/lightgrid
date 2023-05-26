import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 8094,
  },
  plugins: [tsconfigPaths(), react()],
  resolve: {
    // https://github.com/maverick-js/signals#testing
    conditions: process.env.VITEST ? ['test'] : undefined,
  },
})
