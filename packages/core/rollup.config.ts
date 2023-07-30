import { defineConfig } from 'rollup'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import scss from 'rollup-plugin-scss'
import replace from '@rollup/plugin-replace'
import copy from 'rollup-plugin-copy'
import { rimrafSync } from 'rimraf'

const extensions = ['.js', '.jsx', '.ts', '.tsx']
const isProd = process.env.NODE_ENV === 'production'

rimrafSync('./dist')

export default defineConfig({
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'es',
    chunkFileNames: isProd ? '[name]-[hash].js' : '[name].js',
  },
  plugins: [
    replace({
      preventAssignment: true,
      values: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      },
    }),
    nodeResolve({ extensions }),
    typescript(),
    scss({ fileName: 'styles.css', watch: 'src/styles' }),
    copy({
      targets: [{ src: 'src/assets/**/*', dest: 'dist/assets' }],
    }),
  ],
})
