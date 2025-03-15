module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
    extends: [
      "plugin:@typescript-eslint/recommended",
      "prettier",
      "plugin:prettier/recommended"
    ],
    rules: {
      // Custom rules
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
    },
    env: {
      node: true,
    }
};