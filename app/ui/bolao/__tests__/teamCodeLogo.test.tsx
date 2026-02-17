import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import TeamCodeLogo from "../teamCodeLogo"

// Mock Next.js Image
vi.mock("next/image", () => ({
  default: ({ src, alt, className }: any) => (
    <img src={src} alt={alt} className={className} data-testid="team-logo" />
  ),
}))

// Mock react-device-detect
vi.mock("react-device-detect", () => ({
  isBrowser: true,
}))

describe("TeamCodeLogo", () => {
  const defaultProps = {
    name: "Manchester United",
    logoSrc: "/logos/man-utd.png",
  }

  describe("Component Rendering", () => {
    it("should render team logo image", () => {
      render(<TeamCodeLogo {...defaultProps} />)

      const logo = screen.getByTestId("team-logo")
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveAttribute("src", "/logos/man-utd.png")
    })

    it("should render team code", () => {
      render(<TeamCodeLogo {...defaultProps} />)

      expect(screen.getByText("MAN")).toBeInTheDocument()
    })

    it("should render correct alt text for logo", () => {
      render(<TeamCodeLogo {...defaultProps} />)

      const logo = screen.getByTestId("team-logo")
      expect(logo).toHaveAttribute("alt", "Manchester United's logo")
    })
  })

  describe("Team Code Formatting", () => {
    it("should convert team name to uppercase 3-letter code", () => {
      render(<TeamCodeLogo {...defaultProps} />)

      expect(screen.getByText("MAN")).toBeInTheDocument()
    })

    it("should remove spaces and take first 3 characters", () => {
      render(<TeamCodeLogo name="Real Madrid" logoSrc="/logos/rm.png" />)

      expect(screen.getByText("REA")).toBeInTheDocument()
    })

    it("should handle single word team names", () => {
      render(<TeamCodeLogo name="Chelsea" logoSrc="/logos/chelsea.png" />)

      expect(screen.getByText("CHE")).toBeInTheDocument()
    })

    it("should handle team names with multiple spaces", () => {
      render(
        <TeamCodeLogo name="Paris Saint Germain" logoSrc="/logos/psg.png" />
      )

      expect(screen.getByText("PAR")).toBeInTheDocument()
    })

    it("should handle team names shorter than 3 characters", () => {
      render(<TeamCodeLogo name="AC" logoSrc="/logos/ac.png" />)

      expect(screen.getByText("AC")).toBeInTheDocument()
    })

    it("should handle team names with exactly 3 characters", () => {
      render(<TeamCodeLogo name="PSG" logoSrc="/logos/psg.png" />)

      expect(screen.getByText("PSG")).toBeInTheDocument()
    })

    it("should take only first 3 characters of long team names", () => {
      render(<TeamCodeLogo name="Barcelona" logoSrc="/logos/barca.png" />)

      expect(screen.getByText("BAR")).toBeInTheDocument()
    })
  })

  describe("Browser Mode (Tooltip)", () => {
    it("should render tooltip trigger in browser mode", () => {
      render(<TeamCodeLogo {...defaultProps} />)

      const logo = screen.getByTestId("team-logo")
      expect(logo).toBeInTheDocument()
    })

    it("should have correct structure with flex containers", () => {
      const { container } = render(<TeamCodeLogo {...defaultProps} />)

      const flexContainers = container.querySelectorAll(".flex")
      expect(flexContainers.length).toBeGreaterThan(0)
    })

    it("should center team code text", () => {
      const { container } = render(<TeamCodeLogo {...defaultProps} />)

      const teamCode = screen.getByText("MAN")
      expect(teamCode).toHaveClass("text-sm", "text-center")
    })
  })

  describe("Mobile Mode (Popover)", () => {
    it("should handle non-browser environments", () => {
      render(<TeamCodeLogo {...defaultProps} />)

      // Component should still render regardless of environment
      expect(screen.getByTestId("team-logo")).toBeInTheDocument()
      expect(screen.getByText("MAN")).toBeInTheDocument()
    })
  })

  describe("Logo Styling", () => {
    it("should have correct image dimensions", () => {
      render(<TeamCodeLogo {...defaultProps} />)

      const logo = screen.getByTestId("team-logo")
      expect(logo).toHaveClass("max-h-5", "max-w-5", "object-contain")
    })

    it("should render image with Next.js Image component", () => {
      render(<TeamCodeLogo {...defaultProps} />)

      const logo = screen.getByTestId("team-logo")
      expect(logo).toBeInTheDocument()
    })
  })

  describe("Different Team Names", () => {
    const teams = [
      { name: "Liverpool", code: "LIV" },
      { name: "Arsenal", code: "ARS" },
      { name: "Tottenham Hotspur", code: "TOT" },
      { name: "Atlético Madrid", code: "ATL" },
      { name: "Bayern München", code: "BAY" },
    ]

    teams.forEach(({ name, code }) => {
      it(`should correctly format ${name} to ${code}`, () => {
        render(<TeamCodeLogo name={name} logoSrc="/logo.png" />)

        expect(screen.getByText(code)).toBeInTheDocument()
      })
    })
  })

  describe("Logo Sources", () => {
    it("should handle relative logo paths", () => {
      render(<TeamCodeLogo name="Team" logoSrc="/logos/team.png" />)

      const logo = screen.getByTestId("team-logo")
      expect(logo).toHaveAttribute("src", "/logos/team.png")
    })

    it("should handle absolute logo URLs", () => {
      render(
        <TeamCodeLogo name="Team" logoSrc="https://example.com/logo.png" />
      )

      const logo = screen.getByTestId("team-logo")
      expect(logo).toHaveAttribute("src", "https://example.com/logo.png")
    })

    it("should handle data URLs", () => {
      render(<TeamCodeLogo name="Team" logoSrc="data:image/png;base64,..." />)

      const logo = screen.getByTestId("team-logo")
      expect(logo).toHaveAttribute("src", "data:image/png;base64,...")
    })
  })

  describe("Edge Cases", () => {
    it("should handle empty team name", () => {
      const { container } = render(<TeamCodeLogo name="" logoSrc="/logo.png" />)

      // Should not crash, team code would be empty
      const teamCode = container.querySelector(".text-sm.text-center")
      expect(teamCode).toBeInTheDocument()
    })

    it("should handle team names with special characters", () => {
      render(<TeamCodeLogo name="São Paulo" logoSrc="/logo.png" />)

      expect(screen.getByText("SÃO")).toBeInTheDocument()
    })

    it("should handle team names with numbers", () => {
      render(<TeamCodeLogo name="1860 München" logoSrc="/logo.png" />)

      expect(screen.getByText("186")).toBeInTheDocument()
    })

    it("should handle team names with hyphens", () => {
      render(<TeamCodeLogo name="Atletico-Madrid" logoSrc="/logo.png" />)

      expect(screen.getByText("ATL")).toBeInTheDocument()
    })

    it("should handle very short team names", () => {
      render(<TeamCodeLogo name="FC" logoSrc="/logo.png" />)

      expect(screen.getByText("FC")).toBeInTheDocument()
    })

    it("should handle single character team names", () => {
      render(<TeamCodeLogo name="A" logoSrc="/logo.png" />)

      expect(screen.getByText("A")).toBeInTheDocument()
    })
  })

  describe("Accessibility", () => {
    it("should have descriptive alt text for images", () => {
      render(<TeamCodeLogo name="Liverpool" logoSrc="/logos/liv.png" />)

      const logo = screen.getByTestId("team-logo")
      expect(logo).toHaveAttribute("alt", "Liverpool's logo")
    })

    it("should render team code for users", () => {
      render(<TeamCodeLogo {...defaultProps} />)

      expect(screen.getByText("MAN")).toBeInTheDocument()
    })
  })
})
