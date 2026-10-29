import { cleanup, render, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { themeColors } from "@/app/lib/themeColors"
import { ThemeProvider } from "../theme-provider"

const themeState = vi.hoisted(() => ({ resolvedTheme: "light" }))

vi.mock("next-themes", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => themeState,
}))

describe("ThemeProvider", () => {
  afterEach(() => {
    cleanup()
    document.head.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.remove())
    themeState.resolvedTheme = "light"
  })

  it("keeps browser theme-color metadata in sync with the resolved theme", async () => {
    const lightMeta = document.createElement("meta")
    lightMeta.name = "theme-color"
    lightMeta.media = "(prefers-color-scheme: light)"

    const darkMeta = document.createElement("meta")
    darkMeta.name = "theme-color"
    darkMeta.media = "(prefers-color-scheme: dark)"

    document.head.append(lightMeta, darkMeta)

    const { rerender } = render(
      <ThemeProvider>
        <div>Content</div>
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(lightMeta.content).toBe(themeColors.light)
      expect(darkMeta.content).toBe(themeColors.light)
    })

    themeState.resolvedTheme = "dark"
    rerender(
      <ThemeProvider>
        <div>Content</div>
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(lightMeta.content).toBe(themeColors.dark)
      expect(darkMeta.content).toBe(themeColors.dark)
    })
  })
})
