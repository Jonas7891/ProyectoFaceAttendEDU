// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");
const faceattend = require("./eslint-rules");
const globals = require("globals");

module.exports = defineConfig([
  expoConfig,
  {
    // Generated output and the DigitalPersona SDK copied by scripts/copy-digitalpersona.mjs.
    ignores: ["dist/**", "coverage/**", "public/vendor/**"],
  },
  {
    // Jest test files and their helpers run under Node with the Jest globals
    // (describe/test/expect/jest...). Without this, every test reports no-undef.
    files: [
      "**/__tests__/**",
      "**/*.test.js",
      "src/services/api/testing/**",
      "**/testUtils/**",
      "jest.setup.js",
      "jest.global-setup.js",
    ],
    languageOptions: { globals: { ...globals.jest, ...globals.node } },
    // Tests read a hook through `let vm; function Probe() { vm = useX(); }`.
    // That reassignment is what react-hooks/globals (a React Compiler rule)
    // reports, and tests are never compiled by the React Compiler.
    rules: { "react-hooks/globals": "off" },
  },
  {
    // Build and QA scripts run under Node, not in the browser bundle.
    files: ["scripts/**", "tools/**", "eslint-rules/**", "*.config.js", "*.mjs"],
    languageOptions: { globals: globals.node },
  },
  {
    // Estándar de botones: el color sale del tema (Configuración > Apariencia).
    // Los propios botones (Button/IconButton/buttonColors) son la fuente del estándar.
    files: ["src/view/**/*.js"],
    ignores: ["src/view/components/common/buttons/**", "**/__tests__/**"],
    plugins: { faceattend },
    rules: {
      "faceattend/button-standard": "error",
    },
  },
]);
