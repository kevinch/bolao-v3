import path from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

const root = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "tests/e2e/**"],
    pool: "forks",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "json-summary", "html"],
      include: ["app/**/*.{ts,tsx}"],
      exclude: [
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "**/__tests__/**",
        "**/node_modules/**",
        "**/.next/**",
        "**/app/api/**",
        "**/*Svg.tsx",
        "**/styles.ts",
        "**/definitions.ts",
        "**/declarations.d.ts",
        "app/lib/data.ts",
        "app/lib/mock.ts",
        "app/sign-up/db/page.tsx",
        "app/components/userButtonWrapper.tsx",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(root, "./"),
    },
  },
  oxc: {
    jsx: {
      runtime: "automatic",
    },
  },
})
