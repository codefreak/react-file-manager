module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig-base.json',
  },
  env: {
    browser: true,
    node: true
  },
  plugins: ['@typescript-eslint'],
  extends: ['airbnb-typescript', 'prettier'],
  rules: {
    // the following two are only important for this library
    "react/jsx-props-no-spreading": "off",
    // buggy with TS https://github.com/yannickcr/eslint-plugin-react/issues/2654
    "react/prop-types": "off",
    // i++ is okay for usage in loops
    "no-plusplus": ["error", { "allowForLoopAfterthoughts": true }]
  }
}
