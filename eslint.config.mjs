import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([
  {
    ignores: ["coverage/**", ".next/**", "node_modules/**"],
  },
  {
    extends: [...nextCoreWebVitals],

    rules: {
      "react/no-unescaped-entities": "off",
    },
  },
  {
    files: ["**/__tests__/**/*.{ts,tsx}", "**/*.test.{ts,tsx}"],
    rules: {
      // Mocks for next/image intentionally render <img> in tests
      "@next/next/no-img-element": "off",
    },
  },
]);