import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import typescript from '@rollup/plugin-typescript'

// https://vitejs.dev/config/
const config = defineConfig({
  server: {
    port: 8094,
  },
  plugins: [tsconfigPaths(), react()],
})

if (process.env.BUILD_MODE === 'lib') {
  Object.assign(config, {
    define: { 'process.env.NODE_ENV': '"production"' },
    plugins: [
      ...config.plugins,
      {
        ...typescript({
          declarationDir: resolve('./dist'),
          rootDir: resolve('./src'),
          compilerOptions: {
            emitDeclarationOnly: true,
          },
        }),
        apply: 'build',
      },
    ],
    build: {
      lib: {
        // Could also be a dictionary or array of multiple entry points
        entry: resolve(__dirname, 'src/lib.ts'),
        name: 'Lightgrid',
        // the proper extensions will be added
        fileName: 'index',
      },
      rollupOptions: {
        // make sure to externalize deps that shouldn't be bundled
        // into your library
        external: ['react', 'react-dom'],
        output: {
          // Provide global variables to use in the UMD build
          // for externalized deps
          globals: {
            react: 'React',
            reactDOM: 'ReactDOM',
          },
        },
      },
    },
  })
}

export default config
