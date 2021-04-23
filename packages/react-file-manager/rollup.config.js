import baseConfig from '../../rollup-base.config'

export default {
  ...baseConfig,
  input: 'src/index.tsx',
  external: [
    ...baseConfig.external,
    'react-dnd',
    'react-dnd-html5-backend'
  ]
}
