import { resolve } from 'path'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from '@solidjs/start/config'

export default defineConfig({
  start: { ssr: false },
  plugins: [tsconfigPaths()],
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/lib.ts'),
      name: 'LightgridSolid',
      // the proper extensions will be added
      fileName: 'lightgrid-solid',
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['solid-js'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          'solid-js': 'SolidJS',
        },
      },
    },
  },
})
