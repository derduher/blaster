const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const jestPlugin = require("eslint-plugin-jest");
const prettierPlugin = require("eslint-plugin-prettier");
const prettierConfig = require("eslint-config-prettier");
const globals = require("globals");

module.exports = tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      jest: jestPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierConfig.rules,
      "prettier/prettier": "error",
      "lines-between-class-members": [
        "error",
        "always",
        {
          exceptAfterSingleLine: true,
        },
      ],
      "no-case-declarations": 0,
      "no-console": 0,
      "no-unused-vars": 0,
      "padding-line-between-statements": [
        "error",
        {
          blankLine: "always",
          prev: "multiline-expression",
          next: "multiline-expression",
        },
      ],
      "@typescript-eslint/explicit-member-accessibility": "off",
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "none",
        },
      ],
    },
  },
  {
    ignores: ["node_modules", "build", "dist"],
  },
);
