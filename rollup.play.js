// rollup.config.js

import buble from 'rollup-plugin-buble'
import minify from 'rollup-plugin-minify'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'

export default {
  entry: './play/index.js',
  plugins: [
    buble(),
    nodeResolve(),
    commonjs()
  ],
  targets: [
    { format: 'iife', dest: './play/build.js' }
  ]
}
