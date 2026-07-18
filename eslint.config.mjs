import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";

export default tseslint.config(
  {
    ignores: ["dist/**", "coverage/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierRecommended,
  {
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      indent: "off",
      "lines-between-class-members": [
        "error",
        "always",
        {
          exceptAfterSingleLine: true,
        },
      ],
      "no-case-declarations": "off",
      "no-console": "off",
      "no-unused-vars": "off",
      "padding-line-between-statements": [
        "error",
        {
          blankLine: "always",
          prev: "multiline-expression",
          next: "multiline-expression",
        },
      ],
      "@typescript-eslint/explicit-member-accessibility": "off",
      "@typescript-eslint/parameter-properties": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "none",
        },
      ],
    },
  },
  {
    files: ["**/*.spec.ts"],
    languageOptions: {
      globals: {
        ...globals.vitest,
      },
    },
  },
);
