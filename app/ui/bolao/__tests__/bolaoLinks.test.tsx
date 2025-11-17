import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import BolaoLinks from "../bolaoLinks"

// Mock Next.js Link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

describe("BolaoLinks", () => {
  const defaultProps = {
    bolaoId: "bolao-123",
  }

  describe("Component Rendering", () => {
    it("should render all navigation links", () => {
      render(<BolaoLinks {...defaultProps} />)

      expect(screen.getByText("BET")).toBeInTheDocument()
      expect(screen.getByText("STANDINGS")).toBeInTheDocument()
      expect(screen.getByText("RESULTS")).toBeInTheDocument()
      expect(screen.getByText("LEAD")).toBeInTheDocument()
    })

    it("should render links as buttons", () => {
      render(<BolaoLinks {...defaultProps} />)

      const links = screen.getAllByRole("link")
      expect(links).toHaveLength(4)
    })
  })

  describe("Navigation Links", () => {
    it("should have correct href for BET link", () => {
      render(<BolaoLinks {...defaultProps} />)

      const betLink = screen.getByText("BET").closest("a")
      expect(betLink).toHaveAttribute("href", "/bolao/bolao-123/bet")
    })

    it("should have correct href for STANDINGS link", () => {
      render(<BolaoLinks {...defaultProps} />)

      const standingsLink = screen.getByText("STANDINGS").closest("a")
      expect(standingsLink).toHaveAttribute(
        "href",
        "/bolao/bolao-123/standings"
      )
    })

    it("should have correct href for RESULTS link", () => {
      render(<BolaoLinks {...defaultProps} />)

      const resultsLink = screen.getByText("RESULTS").closest("a")
      expect(resultsLink).toHaveAttribute("href", "/bolao/bolao-123/results")
    })

    it("should have correct href for LEAD link", () => {
      render(<BolaoLinks {...defaultProps} />)

      const leadLink = screen.getByText("LEAD").closest("a")
      expect(leadLink).toHaveAttribute("href", "/bolao/bolao-123/lead")
    })
  })

  describe("Different Bolao IDs", () => {
    it("should use provided bolaoId in all links", () => {
      const customBolaoId = "custom-bolao-456"
      render(<BolaoLinks bolaoId={customBolaoId} />)

      const links = screen.getAllByRole("link")
      links.forEach((link) => {
        expect(link.getAttribute("href")).toContain(customBolaoId)
      })
    })

    it("should handle numeric bolaoId", () => {
      render(<BolaoLinks bolaoId="12345" />)

      const betLink = screen.getByText("BET").closest("a")
      expect(betLink).toHaveAttribute("href", "/bolao/12345/bet")
    })

    it("should handle bolaoId with special characters", () => {
      render(<BolaoLinks bolaoId="bolao-test_123" />)

      const betLink = screen.getByText("BET").closest("a")
      expect(betLink).toHaveAttribute("href", "/bolao/bolao-test_123/bet")
    })

    it("should handle UUID-style bolaoId", () => {
      const uuid = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
      render(<BolaoLinks bolaoId={uuid} />)

      const links = screen.getAllByRole("link")
      links.forEach((link) => {
        expect(link.getAttribute("href")).toContain(uuid)
      })
    })
  })

  describe("Layout and Styling", () => {
    it("should have flex container with centered content", () => {
      const { container } = render(<BolaoLinks {...defaultProps} />)

      const flexContainer = container.querySelector(".flex")
      expect(flexContainer).toHaveClass("flex", "justify-center", "space-x-4")
    })

    it("should render buttons in correct order", () => {
      render(<BolaoLinks {...defaultProps} />)

      const links = screen.getAllByRole("link")
      expect(links[0]).toHaveTextContent("BET")
      expect(links[1]).toHaveTextContent("STANDINGS")
      expect(links[2]).toHaveTextContent("RESULTS")
      expect(links[3]).toHaveTextContent("LEAD")
    })
  })

  describe("Link Text", () => {
    it("should display link text in uppercase", () => {
      render(<BolaoLinks {...defaultProps} />)

      expect(screen.getByText("BET")).toBeInTheDocument()
      expect(screen.getByText("STANDINGS")).toBeInTheDocument()
      expect(screen.getByText("RESULTS")).toBeInTheDocument()
      expect(screen.getByText("LEAD")).toBeInTheDocument()

      // Should not find lowercase versions
      expect(screen.queryByText("bet")).not.toBeInTheDocument()
      expect(screen.queryByText("standings")).not.toBeInTheDocument()
      expect(screen.queryByText("results")).not.toBeInTheDocument()
      expect(screen.queryByText("lead")).not.toBeInTheDocument()
    })
  })

  describe("Accessibility", () => {
    it("should have all links accessible by role", () => {
      render(<BolaoLinks {...defaultProps} />)

      const links = screen.getAllByRole("link")
      expect(links).toHaveLength(4)

      links.forEach((link) => {
        expect(link).toHaveAttribute("href")
      })
    })

    it("should have descriptive link text", () => {
      render(<BolaoLinks {...defaultProps} />)

      const betLink = screen.getByRole("link", { name: /BET/i })
      const standingsLink = screen.getByRole("link", { name: /STANDINGS/i })
      const resultsLink = screen.getByRole("link", { name: /RESULTS/i })
      const leadLink = screen.getByRole("link", { name: /LEAD/i })

      expect(betLink).toBeInTheDocument()
      expect(standingsLink).toBeInTheDocument()
      expect(resultsLink).toBeInTheDocument()
      expect(leadLink).toBeInTheDocument()
    })
  })

  describe("Navigation Structure", () => {
    it("should have consistent URL pattern for all links", () => {
      render(<BolaoLinks {...defaultProps} />)

      const links = screen.getAllByRole("link")
      const urlPattern = /^\/bolao\/bolao-123\/(bet|standings|results|lead)$/

      links.forEach((link) => {
        const href = link.getAttribute("href")
        expect(href).toMatch(urlPattern)
      })
    })

    it("should have unique paths for each link", () => {
      render(<BolaoLinks {...defaultProps} />)

      const links = screen.getAllByRole("link")
      const hrefs = links.map((link) => link.getAttribute("href"))

      // Check that all hrefs are unique
      const uniqueHrefs = new Set(hrefs)
      expect(uniqueHrefs.size).toBe(4)
    })
  })

  describe("Active Prop", () => {
    it("should render correctly when active prop is provided", () => {
      render(<BolaoLinks {...defaultProps} active={1} />)

      // Component should still render all links normally
      expect(screen.getByText("BET")).toBeInTheDocument()
      expect(screen.getByText("STANDINGS")).toBeInTheDocument()
      expect(screen.getByText("RESULTS")).toBeInTheDocument()
      expect(screen.getByText("LEAD")).toBeInTheDocument()
    })

    it("should render correctly when active prop is not provided", () => {
      render(<BolaoLinks {...defaultProps} />)

      // Component should render all links normally
      expect(screen.getByText("BET")).toBeInTheDocument()
      expect(screen.getByText("STANDINGS")).toBeInTheDocument()
      expect(screen.getByText("RESULTS")).toBeInTheDocument()
      expect(screen.getByText("LEAD")).toBeInTheDocument()
    })
  })
})
