module.exports = {
  root: true,
  extends: ['@codefreak'],
  overrides: [
    {
      files: ['*.stories.{js,ts,jsx,tsx}'],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off'
      }
    }
  ]
}
