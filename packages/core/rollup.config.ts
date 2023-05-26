import { defineConfig } from 'rollup'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import sass from 'rollup-plugin-sass'
import clean from '@rollup-extras/plugin-clean'
import replace from '@rollup/plugin-replace'

const isProd = process.env.NODE_ENV === 'production'
const extensions = ['.js', '.jsx', '.ts', '.tsx']

export default defineConfig({
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'es',
  },
  plugins: [
    clean(),
    replace({
      preventAssignment: true,
      values: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      },
    }),
    nodeResolve({ extensions }),
    typescript(),
    sass(),
  ],
})
