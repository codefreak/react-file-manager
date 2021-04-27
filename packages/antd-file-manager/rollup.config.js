import baseConfig from '../../rollup-base.config'

const rollupConfig = {
  ...baseConfig,
  input: 'src/index.tsx',
  external: [...baseConfig.external, 'react-dnd', 'react-dnd-html5-backend']
}

export default rollupConfig
