import typescript from '@rollup/plugin-typescript'

export default {
  input: 'src/index.tsx',
  output: {
    dir: 'dist',
    format: 'cjs',
    exports: 'auto'
  },
  plugins: [
    typescript({
      exclude: 'src/**/*.stories.*'
    })
  ],
  external: [
    'react'
  ]
}