import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import BolaoPageTitle from "../bolaoPageTitle"
import type { Bolao } from "@/app/lib/definitions"

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

// Mock BolaoYearBadge component
vi.mock("@/app/components/bolaoYearBadge", () => ({
  default: ({ bolao }: { bolao: Bolao }) => (
    <span data-testid="bolao-year-badge">{bolao.year}</span>
  ),
}))

// Mock Next.js Image
vi.mock("next/image", () => ({
  default: ({ src, alt, width, height }: any) => (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      data-testid="league-logo"
    />
  ),
}))

describe("BolaoPageTitle", () => {
  const mockBolao: Bolao = {
    id: "bolao-123",
    name: "My Awesome Bolao",
    competition_id: "comp-456",
    created_by: "user-789",
    created_at: new Date("2024-01-01"),
    year: 2024,
  }

  describe("Component Rendering", () => {
    it("should render bolao name", () => {
      render(<BolaoPageTitle bolao={mockBolao} />)

      expect(screen.getByText("My Awesome Bolao")).toBeInTheDocument()
    })

    it("should render with centered PageTitle", () => {
      render(<BolaoPageTitle bolao={mockBolao} />)

      const pageTitle = screen.getByTestId("page-title")
      expect(pageTitle).toHaveAttribute("data-center", "true")
    })

    it("should render BolaoYearBadge", () => {
      render(<BolaoPageTitle bolao={mockBolao} />)

      expect(screen.getByTestId("bolao-year-badge")).toBeInTheDocument()
    })
  })

  describe("League Name Display", () => {
    it("should display league name when provided", () => {
      render(<BolaoPageTitle bolao={mockBolao} leagueName="Premier League" />)

      expect(screen.getByText("Premier League")).toBeInTheDocument()
    })

    it("should not display league name when not provided", () => {
      render(<BolaoPageTitle bolao={mockBolao} />)

      const pageTitle = screen.getByTestId("page-title")
      expect(pageTitle).toBeInTheDocument()
      // Should still render bolao name
      expect(screen.getByText("My Awesome Bolao")).toBeInTheDocument()
    })

    it("should display league name with year badge", () => {
      render(<BolaoPageTitle bolao={mockBolao} leagueName="La Liga" />)

      expect(screen.getByText("La Liga")).toBeInTheDocument()
      expect(screen.getByTestId("bolao-year-badge")).toBeInTheDocument()
    })
  })

  describe("League Logo Display", () => {
    it("should display league logo when provided", () => {
      render(
        <BolaoPageTitle
          bolao={mockBolao}
          leagueName="Champions League"
          leagueLogo="/logos/ucl.png"
        />
      )

      const logo = screen.getByTestId("league-logo")
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveAttribute("src", "/logos/ucl.png")
      expect(logo).toHaveAttribute("alt", "Champions League's logo")
    })

    it("should not display logo when not provided", () => {
      render(<BolaoPageTitle bolao={mockBolao} leagueName="Premier League" />)

      expect(screen.queryByTestId("league-logo")).not.toBeInTheDocument()
    })

    it("should display logo with correct dimensions", () => {
      render(
        <BolaoPageTitle
          bolao={mockBolao}
          leagueName="Serie A"
          leagueLogo="/logos/seria-a.png"
        />
      )

      const logo = screen.getByTestId("league-logo")
      expect(logo).toHaveAttribute("width", "60")
      expect(logo).toHaveAttribute("height", "60")
    })

    it("should center logo when displayed", () => {
      const { container } = render(
        <BolaoPageTitle
          bolao={mockBolao}
          leagueName="Ligue 1"
          leagueLogo="/logos/ligue1.png"
        />
      )

      const logoContainer = container.querySelector(".flex.justify-center.mb-6")
      expect(logoContainer).toBeInTheDocument()
    })
  })

  describe("Bolao Data Handling", () => {
    it("should handle different bolao names", () => {
      const bolaos = [
        { ...mockBolao, name: "Office Pool" },
        { ...mockBolao, name: "Friends & Family" },
        { ...mockBolao, name: "2024 Tournament" },
      ]

      bolaos.forEach((bolao) => {
        const { unmount } = render(<BolaoPageTitle bolao={bolao} />)
        expect(screen.getByText(bolao.name)).toBeInTheDocument()
        unmount()
      })
    })

    it("should handle different years", () => {
      const bolaoWithDifferentYear = { ...mockBolao, year: 2023 }
      render(<BolaoPageTitle bolao={bolaoWithDifferentYear} />)

      const yearBadge = screen.getByTestId("bolao-year-badge")
      expect(yearBadge).toHaveTextContent("2023")
    })

    it("should pass complete bolao object to BolaoYearBadge", () => {
      render(<BolaoPageTitle bolao={mockBolao} />)

      expect(screen.getByTestId("bolao-year-badge")).toBeInTheDocument()
    })
  })

  describe("Layout Structure", () => {
    it("should have line break after bolao name", () => {
      render(<BolaoPageTitle bolao={mockBolao} />)

      const pageTitle = screen.getByTestId("page-title")
      expect(pageTitle.innerHTML).toContain("<br")
    })

    it("should render league name and year badge in span with text-lg", () => {
      const { container } = render(
        <BolaoPageTitle bolao={mockBolao} leagueName="Bundesliga" />
      )

      const span = container.querySelector(".text-lg")
      expect(span).toBeInTheDocument()
      expect(span?.textContent).toContain("Bundesliga")
    })

    it("should have proper hierarchy: logo, bolao name, league name with year", () => {
      render(
        <BolaoPageTitle
          bolao={mockBolao}
          leagueName="Premier League"
          leagueLogo="/logos/pl.png"
        />
      )

      const pageTitle = screen.getByTestId("page-title")
      const logo = screen.getByTestId("league-logo")
      const bolaoName = screen.getByText("My Awesome Bolao")
      const leagueName = screen.getByText("Premier League")

      expect(pageTitle).toContainElement(logo)
      expect(pageTitle).toContainElement(bolaoName)
      expect(pageTitle).toContainElement(leagueName)
    })
  })

  describe("Edge Cases", () => {
    it("should handle empty bolao name", () => {
      const emptyNameBolao = { ...mockBolao, name: "" }
      render(<BolaoPageTitle bolao={emptyNameBolao} />)

      const pageTitle = screen.getByTestId("page-title")
      expect(pageTitle).toBeInTheDocument()
    })

    it("should handle very long bolao name", () => {
      const longNameBolao = {
        ...mockBolao,
        name: "This Is A Very Long Bolao Name That Might Cause Layout Issues",
      }
      render(<BolaoPageTitle bolao={longNameBolao} />)

      expect(
        screen.getByText(
          "This Is A Very Long Bolao Name That Might Cause Layout Issues"
        )
      ).toBeInTheDocument()
    })

    it("should handle special characters in league name", () => {
      render(
        <BolaoPageTitle bolao={mockBolao} leagueName="São Paulo & Friends" />
      )

      expect(screen.getByText("São Paulo & Friends")).toBeInTheDocument()
    })

    it("should handle league logo with absolute URL", () => {
      render(
        <BolaoPageTitle
          bolao={mockBolao}
          leagueName="Test League"
          leagueLogo="https://example.com/logo.png"
        />
      )

      const logo = screen.getByTestId("league-logo")
      expect(logo).toHaveAttribute("src", "https://example.com/logo.png")
    })
  })
})
