import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import tsconfigPaths from 'vite-tsconfig-paths'
import postcssNesting from 'postcss-nesting'

export default defineConfig({
  plugins: [tsconfigPaths(), solidPlugin()],
  server: {
    port: 8093,
  },
  build: {
    target: 'es2022',
  },
  css: {
    postcss: {
      plugins: [postcssNesting],
    },
  },
})
