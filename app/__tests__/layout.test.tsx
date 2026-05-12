import { describe, it, expect, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"

import RootLayout, { metadata } from "../layout"

vi.mock("@clerk/nextjs", () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock("next/script", () => ({
  default: () => null,
}))

vi.mock("next/font/google", () => ({
  IBM_Plex_Sans: () => ({
    className: "ibm-plex-sans-font",
  }),
}))

vi.mock("../globals.css", () => ({}))

describe("RootLayout", () => {
  describe("Metadata", () => {
    it("should export metadata with correct title", () => {
      expect(metadata).toBeDefined()
      expect(metadata.title).toBe("Bolão.io v3")
    })

    it("should export metadata with correct description", () => {
      expect(metadata).toBeDefined()
      expect(metadata.description).toBe("Free soccer bets with friends.")
    })
  })

  describe("Rendering", () => {
    it("should render children inside body", async () => {
      const Layout = await RootLayout({
        children: <div data-testid="child-content">Child Content</div>,
      })
      const html = renderToStaticMarkup(Layout)

      expect(html).toContain("child-content")
      expect(html).toContain("ibm-plex-sans-font")
    })
  })
})
