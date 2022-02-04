module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    // Use recommended rules from the @typescript-eslint/eslint-plugin
    'plugin:@typescript-eslint/recommended',
    // Disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    'prettier/@typescript-eslint',
    // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors.
    // Make sure this is always the last configuration in the extends array.
    'plugin:prettier/recommended',
  ],
  env: {
    browser: false,
    amd: false,
    es6: true,
    node: true,
  },
  plugins: [],
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module', // allow use of imports
  },

  rules: {
    //extra
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  globals: {
    console: true,
  },
}
