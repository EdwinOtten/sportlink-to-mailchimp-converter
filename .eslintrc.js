module.exports = {
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended-type-checked',
      'plugin:@typescript-eslint/stylistic-type-checked',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: ["tsconfig.json"],
    },
    plugins: ['@typescript-eslint'],
    root: true,
    rules: {
        semi: ["error", "never"]
    }
  };