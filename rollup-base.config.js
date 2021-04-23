import typescript from '@rollup/plugin-typescript'

export default {
  output: {
    dir: 'dist',
    format: 'cjs',
    exports: 'named'
  },
  plugins: [
    typescript({
      exclude: 'src/**/*.{stories,example}.*'
    })
  ],
  external: [
    'react'
  ]
}
