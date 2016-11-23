// rollup.config.js

import buble from 'rollup-plugin-buble'
import minify from 'rollup-plugin-minify'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'

export default {
  entry: './src/index.js',
  moduleName: 'msearch',
  moduleId: 'msearch',
  plugins: [
    buble(),
    nodeResolve(),
    commonjs(),
    minify({iife: 'dist/msearch.min.js'})
  ],
  targets: [
    { format: 'es',   dest: 'dist/msearch.es.js'   },
    { format: 'cjs',  dest: 'dist/msearch.cjs.js'  },
    { format: 'amd',  dest: 'dist/msearch.amd.js'  },
    { format: 'iife', dest: 'dist/msearch.iife.js' },
  ]
}
