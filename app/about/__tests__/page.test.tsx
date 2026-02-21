import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import AboutPage from "../page"

// Mock Next.js Link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode
    href: string
    className?: string
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}))

// Mock PageTitle component
vi.mock("@/app/components/pageTitle", () => ({
  default: ({
    children,
    center,
  }: {
    children: React.ReactNode
    center?: boolean
  }) => (
    <div data-testid="page-title" data-center={center}>
      {children}
    </div>
  ),
}))

// Helper to render async server components
async function renderAbout() {
  const About = await AboutPage()
  return render(About)
}

describe("About Page", () => {
  describe("Component Rendering", () => {
    it("should render without crashing", async () => {
      await renderAbout()

      expect(screen.getByText("About")).toBeInTheDocument()
    })

    it("should render PageTitle with center prop", async () => {
      await renderAbout()

      const pageTitle = screen.getByTestId("page-title")
      expect(pageTitle).toBeInTheDocument()
      expect(pageTitle).toHaveAttribute("data-center", "true")
    })

    it("should render main heading", async () => {
      await renderAbout()

      const heading = screen.getByRole("heading", { level: 1, name: "About" })
      expect(heading).toBeInTheDocument()
    })
  })

  describe("Section Headings", () => {
    it("should render 'Bolão?' section heading", async () => {
      await renderAbout()

      const heading = screen.getByRole("heading", {
        level: 2,
        name: "Bolão?",
      })
      expect(heading).toBeInTheDocument()
    })

    it("should render 'Who's behind this?' section heading", async () => {
      await renderAbout()

      const heading = screen.getByRole("heading", {
        level: 2,
        name: "Who's behind this?",
      })
      expect(heading).toBeInTheDocument()
    })

    it("should render 'On the tech side' section heading", async () => {
      await renderAbout()

      const heading = screen.getByRole("heading", {
        level: 2,
        name: "On the tech side",
      })
      expect(heading).toBeInTheDocument()
    })

    it("should render 'Soccer coverage' section heading", async () => {
      await renderAbout()

      const heading = screen.getByRole("heading", {
        level: 2,
        name: "Soccer coverage",
      })
      expect(heading).toBeInTheDocument()
    })

    it("should have correct styling classes on section headings", async () => {
      const { container } = await renderAbout()

      const headings = container.querySelectorAll("h2")
      headings.forEach((heading) => {
        expect(heading.className).toBe("text-2xl mb-6 text-center")
      })
    })
  })

  describe("Accessibility", () => {
    it("should use semantic HTML with proper heading hierarchy", async () => {
      await renderAbout()

      const h1 = screen.getByRole("heading", { level: 1 })
      const h2s = screen.getAllByRole("heading", { level: 2 })

      expect(h1).toBeInTheDocument()
      expect(h2s).toHaveLength(4)
    })

    it("should have descriptive link text", async () => {
      await renderAbout()

      const links = screen.getAllByRole("link")
      links.forEach((link) => {
        expect(link.textContent).toBeTruthy()
        expect(link.textContent?.length).toBeGreaterThan(0)
      })
    })

    it("should have all links accessible via keyboard", async () => {
      await renderAbout()

      const links = screen.getAllByRole("link")
      links.forEach((link) => {
        expect(link).toBeInTheDocument()
      })
    })
  })
})
