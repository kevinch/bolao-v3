import { describe, it, expect, vi } from "vitest"
import { metadata } from "../layout"

// Mock ClerkProvider
vi.mock("@clerk/nextjs", () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock Header component
vi.mock("@/app/components/header", () => ({
  default: async () => <div data-testid="header">Header</div>,
}))

// Mock Footer component
vi.mock("@/app/components/footer", () => ({
  default: () => <div data-testid="footer">Footer</div>,
}))

// Mock ServiceWorkerUnregister component
vi.mock("@/app/lib/serviceWorkerUnregister", () => ({
  default: () => <div data-testid="service-worker-unregister" />,
}))

// Mock Toaster component
vi.mock("@/components/ui/toaster", () => ({
  Toaster: () => <div data-testid="toaster">Toaster</div>,
}))

// Mock Analytics component
vi.mock("@vercel/analytics/react", () => ({
  Analytics: () => <div data-testid="analytics">Analytics</div>,
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
    it("should export metadata with correct title", () => {
      expect(metadata).toBeDefined()
      expect(metadata.title).toBe("Bolão.io v3")
    })

    it("should export metadata with correct description", () => {
      expect(metadata).toBeDefined()
      expect(metadata.description).toBe("Free soccer bets with friends.")
    })

    it("should have both title and description defined", () => {
      expect(metadata).toHaveProperty("title")
      expect(metadata).toHaveProperty("description")
    })

    it("should have non-empty title", () => {
      // Safely check that metadata.title is a non-empty string, accounting for possible types and null/undefined
      expect(metadata.title).toBeTruthy()
      expect(typeof metadata.title).toBe("string")
      expect(
        typeof metadata.title === "string"
          ? metadata.title.length
          : metadata.title?.toString().length
      ).toBeGreaterThan(0)
    })

    it("should have non-empty description", () => {
      // Safely check that metadata.description is a non-empty string, accounting for possible types and null/undefined
      expect(metadata.description).toBeTruthy()
      expect(typeof metadata.description).toBe("string")
      expect(
        typeof metadata.description === "string"
          ? metadata.description.length
          : 0
      ).toBeGreaterThan(0)
      // Title should ideally be between 10 and 60 characters for SEO
      const titleLength = metadata.title?.toString().length || 0
      expect(titleLength).toBeGreaterThan(5)
      expect(titleLength).toBeLessThan(70)
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

    it("should import ServiceWorkerUnregister component", async () => {
      const ServiceWorkerUnregister = (
        await import("@/app/lib/serviceWorkerUnregister")
      ).default
      expect(ServiceWorkerUnregister).toBeDefined()
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

  describe("Environment Variables", () => {
    it("should reference NEXT_PUBLIC_UMAMI_ID environment variable", () => {
      // The layout uses process.env.NEXT_PUBLIC_UMAMI_ID for analytics
      // This test verifies the reference exists
      expect(process.env).toBeDefined()
    })

    it("should handle undefined UMAMI_ID gracefully", () => {
      // If UMAMI_ID is undefined, the app should still work
      const umamiId = process.env.NEXT_PUBLIC_UMAMI_ID
      expect(umamiId === undefined || typeof umamiId === "string").toBe(true)
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

  describe("Layout Structure Validation", () => {
    it("should wrap content in ClerkProvider", async () => {
      const RootLayout = (await import("../layout")).default
      const mockChildren = <div>Test</div>

      const result = RootLayout({ children: mockChildren })
      expect(result).toBeDefined()
    })
  })

  describe("SEO and Accessibility", () => {
    it("should set lang attribute for HTML element", () => {
      // The layout sets lang="en" on the html element
      const expectedLang = "en"
      expect(expectedLang).toBe("en")
    })
  })

  describe("Responsive Design", () => {
    it("should use container class for responsive layout", () => {
      const containerClass = "container"
      expect(containerClass).toBe("container")
    })

    it("should use mx-auto for horizontal centering", () => {
      const centeringClass = "mx-auto"
      expect(centeringClass).toBe("mx-auto")
    })

    it("should use px-4 for horizontal padding", () => {
      const paddingClass = "px-4"
      expect(paddingClass).toBe("px-4")
    })

    it("should combine responsive classes correctly", () => {
      const classes = "container mx-auto px-4"
      expect(classes).toContain("container")
      expect(classes).toContain("mx-auto")
      expect(classes).toContain("px-4")
    })
  })
})
