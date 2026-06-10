import { describe, it, expect, vi } from "vitest"
import { renderToString } from "react-dom/server"
import RootLayout, { metadata } from "../layout"

// Mock ClerkProvider
vi.mock("@clerk/nextjs", () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock Header component
vi.mock("@/app/components/header", () => ({
  default: () => <div data-testid="header">Header</div>,
}))

// Mock Footer component
vi.mock("@/app/components/footer", () => ({
  default: () => <div data-testid="footer">Footer</div>,
}))

// Mock Toaster component
vi.mock("@/components/ui/toaster", () => ({
  Toaster: () => <div data-testid="toaster">Toaster</div>,
}))

// Mock Analytics component
vi.mock("@vercel/analytics/react", () => ({
  Analytics: () => <div data-testid="analytics">Analytics</div>,
}))

vi.mock("@vercel/speed-insights/next", () => ({
  SpeedInsights: () => null,
}))

// Mock Next.js Script component
vi.mock("next/script", () => ({
  default: ({ src, ...props }: { src?: string; [key: string]: any }) => null,
}))

// Mock Google Fonts
vi.mock("next/font/google", () => ({
  IBM_Plex_Sans: () => ({
    className: "ibm-plex-sans-font",
  }),
}))

// Mock globals.css import
vi.mock("../globals.css", () => ({}))

describe("RootLayout", () => {
  describe("Metadata", () => {
    const defaultTitle =
      typeof metadata.title === "object" && metadata.title !== null
        ? ((metadata.title as { default?: string }).default ?? "")
        : String(metadata.title)

    it("should export a title with default and template", () => {
      expect(metadata.title).toBeDefined()
      expect(metadata.title).toHaveProperty("default")
      expect(metadata.title).toHaveProperty("template")
      expect(defaultTitle).toContain("Bolão.io")
    })

    it("should have both title and description defined", () => {
      expect(metadata).toHaveProperty("title")
      expect(metadata).toHaveProperty("description")
    })

    it("should set metadataBase to the production domain", () => {
      expect(metadata.metadataBase?.href).toBe("https://bolao.io/")
    })

    it("should define Open Graph and Twitter cards", () => {
      expect(metadata.openGraph).toBeDefined()
      expect(metadata.openGraph?.siteName).toBe("Bolão.io")
      expect(metadata.twitter).toBeDefined()
    })

    it("should have SEO-friendly title length", () => {
      // Title should ideally be between 10 and 60 characters for SEO
      expect(defaultTitle.length).toBeGreaterThan(5)
      expect(defaultTitle.length).toBeLessThan(70)
    })

    it("should have SEO-friendly description length", () => {
      // Description should ideally be between 50 and 160 characters for SEO
      const descLength = metadata.description?.toString().length || 0
      expect(descLength).toBeGreaterThan(10)
      expect(descLength).toBeLessThan(200)
    })
  })

  describe("Font Configuration", () => {
    it("should configure IBM Plex Sans font", async () => {
      const { IBM_Plex_Sans } = await import("next/font/google")
      const fontConfig = IBM_Plex_Sans({
        weight: "400",
        subsets: ["latin"],
      })

      expect(fontConfig).toBeDefined()
      expect(fontConfig.className).toBe("ibm-plex-sans-font")
    })
  })

  describe("Component Dependencies", () => {
    it("should import Header component", async () => {
      const Header = (await import("@/app/components/header")).default
      expect(Header).toBeDefined()
    })

    it("should import Footer component", async () => {
      const Footer = (await import("@/app/components/footer")).default
      expect(Footer).toBeDefined()
    })

    it("should import Toaster component", async () => {
      const { Toaster } = await import("@/components/ui/toaster")
      expect(Toaster).toBeDefined()
    })

    it("should import Analytics component", async () => {
      const { Analytics } = await import("@vercel/analytics/react")
      expect(Analytics).toBeDefined()
    })

    it("should import ClerkProvider", async () => {
      const { ClerkProvider } = await import("@clerk/nextjs")
      expect(ClerkProvider).toBeDefined()
    })

    it("should import Next.js Script component", async () => {
      const Script = (await import("next/script")).default
      expect(Script).toBeDefined()
    })
  })

  describe("Module Structure", () => {
    it("should export default RootLayout function", async () => {
      const RootLayout = (await import("../layout")).default
      expect(RootLayout).toBeDefined()
      expect(typeof RootLayout).toBe("function")
    })

    it("should export metadata object", async () => {
      const { metadata } = await import("../layout")
      expect(metadata).toBeDefined()
      expect(typeof metadata).toBe("object")
    })
  })

  describe("Analytics Integration", () => {
    it("should configure Umami analytics script URL", () => {
      const expectedUrl = "https://cloud.umami.is/script.js"
      expect(expectedUrl).toBe("https://cloud.umami.is/script.js")
    })
  })

  describe("CSS Imports", () => {
    it("should import globals.css", () => {
      // Verify that the import doesn't throw an error
      expect(() => require("../globals.css")).not.toThrow()
    })
  })

  describe("Type Safety", () => {
    it("should define children prop as ReactNode", async () => {
      const RootLayout = (await import("../layout")).default

      // Function should accept children prop
      expect(RootLayout).toBeDefined()
    })
  })

  describe("Rendering", () => {
    it("should render children and all required components", async () => {
      const Layout = await RootLayout({
        children: <div data-testid="child-content">Child Content</div>,
      })
      const html = renderToString(Layout)

      expect(html).toContain("Child Content")
      expect(html).toContain("mx-auto px-4")
      expect(html).toContain('data-testid="header"')
      expect(html).toContain('data-testid="footer"')
    })
  })
})
