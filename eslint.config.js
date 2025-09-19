// eslint.config.js
import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import pluginReact from "eslint-plugin-react";

export default defineConfig([
  // Basis-Empfehlungen
  js.configs.recommended,
  // React-Empfehlungen (Flat Config des Plugins)
  pluginReact.configs.flat.recommended,

  // Projektregeln (überschreiben ggf. obige Defaults)
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    settings: {
      react: { version: "detect" }, // React-Version automatisch
    },
    rules: {
      // 👉 deine gewünschten Abschaltungen/Fixes
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "no-empty": ["warn", { allowEmptyCatch: true }],
    },
  },
]);
