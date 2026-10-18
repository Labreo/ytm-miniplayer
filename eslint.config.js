import globals from "globals";

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: ["src/browser-polyfill.min.js"],
  },
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",   // extension scripts are not ES modules
      globals: {
        ...globals.browser,
        browser: "readonly",  // webextension-polyfill global
        chrome: "readonly",   // chrome extension API global
        importScripts: "readonly",
        module: "readonly", // service worker importScripts global
      },
    },
    rules: {
      // ── Possible errors ──────────────────────────────────────────────
      "no-console": "warn",
      "no-debugger": "error",
      "no-undef": "error",
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],

      // ── Best practices ───────────────────────────────────────────────
      "eqeqeq": ["error", "always"],
      "no-var": "error",
      "prefer-const": "error",
      "curly": ["error", "all"],
      "no-implicit-globals": "off",

      // ── Style (non-formatting — Prettier handles whitespace) ──────────
      "prefer-arrow-callback": "warn",
      "arrow-body-style": ["warn", "as-needed"],
    },
  },
];
