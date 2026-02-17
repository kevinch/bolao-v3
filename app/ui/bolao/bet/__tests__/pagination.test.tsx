import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import Pagination from "../pagination"

// Mock Next.js navigation hooks
const mockUsePathname = vi.fn()
const mockUseSearchParams = vi.fn()

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useSearchParams: () => mockUseSearchParams(),
}))

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

describe("Pagination", () => {
  const defaultProps = {
    currentRoundIndex: 5,
    currentRoundName: "Regular Season - 5",
    isLastRound: false,
    isFirstRound: false,
  }

  beforeEach(() => {
    mockUsePathname.mockReturnValue("/bolao/123/bet")
    mockUseSearchParams.mockReturnValue(new URLSearchParams(""))
  })

  describe("Component Rendering", () => {
    it("should render the current round name", () => {
      render(<Pagination {...defaultProps} />)

      expect(screen.getByText("Regular Season - 5")).toBeInTheDocument()
    })

    it("should render previous and next buttons when not at boundaries", () => {
      render(<Pagination {...defaultProps} />)

      const links = screen.getAllByRole("link")
      expect(links).toHaveLength(2)
    })

    it("should display round text with lowercase and first letter uppercase", () => {
      render(<Pagination {...defaultProps} />)

      const roundText = screen.getByText("Regular Season - 5")
      expect(roundText).toHaveClass("lowercase")
      expect(roundText).toHaveClass("first-letter:uppercase")
    })
  })

  describe("Navigation Buttons", () => {
    it("should show both navigation buttons in the middle of rounds", () => {
      render(<Pagination {...defaultProps} currentRoundIndex={5} />)

      const links = screen.getAllByRole("link")
      expect(links).toHaveLength(2)
    })

    it("should hide previous button on first round", () => {
      render(<Pagination {...defaultProps} isFirstRound={true} />)

      const links = screen.getAllByRole("link")
      expect(links).toHaveLength(1)
    })

    it("should hide next button on last round", () => {
      render(<Pagination {...defaultProps} isLastRound={true} />)

      const links = screen.getAllByRole("link")
      expect(links).toHaveLength(1)
    })

    it("should hide both buttons when first and last round", () => {
      render(
        <Pagination {...defaultProps} isFirstRound={true} isLastRound={true} />
      )

      const links = screen.queryAllByRole("link")
      expect(links).toHaveLength(0)
    })
  })

  describe("URL Generation", () => {
    it("should generate correct URL for previous round", () => {
      mockUsePathname.mockReturnValue("/bolao/123/bet")
      mockUseSearchParams.mockReturnValue(new URLSearchParams(""))

      render(<Pagination {...defaultProps} currentRoundIndex={5} />)

      const links = screen.getAllByRole("link")
      const prevLink = links[0]

      expect(prevLink).toHaveAttribute("href", "/bolao/123/bet?roundIndex=4")
    })

    it("should generate correct URL for next round", () => {
      mockUsePathname.mockReturnValue("/bolao/123/bet")
      mockUseSearchParams.mockReturnValue(new URLSearchParams(""))

      render(<Pagination {...defaultProps} currentRoundIndex={5} />)

      const links = screen.getAllByRole("link")
      const nextLink = links[1]

      expect(nextLink).toHaveAttribute("href", "/bolao/123/bet?roundIndex=6")
    })

    it("should preserve existing search params", () => {
      mockUsePathname.mockReturnValue("/bolao/123/bet")
      mockUseSearchParams.mockReturnValue(
        new URLSearchParams("filter=active&sort=date")
      )

      render(<Pagination {...defaultProps} currentRoundIndex={3} />)

      const links = screen.getAllByRole("link")
      const nextLink = links[1]

      const href = nextLink.getAttribute("href")
      expect(href).toContain("roundIndex=4")
      expect(href).toContain("filter=active")
      expect(href).toContain("sort=date")
    })

    it("should override existing roundIndex param", () => {
      mockUsePathname.mockReturnValue("/bolao/123/bet")
      mockUseSearchParams.mockReturnValue(new URLSearchParams("roundIndex=10"))

      render(<Pagination {...defaultProps} currentRoundIndex={5} />)

      const links = screen.getAllByRole("link")
      const nextLink = links[1]

      expect(nextLink).toHaveAttribute("href", "/bolao/123/bet?roundIndex=6")
    })
  })

  describe("Different Round Values", () => {
    it("should handle round index 1", () => {
      render(
        <Pagination
          {...defaultProps}
          currentRoundIndex={1}
          currentRoundName="Round 1"
        />
      )

      expect(screen.getByText("Round 1")).toBeInTheDocument()
    })

    it("should handle round index 0", () => {
      render(
        <Pagination
          {...defaultProps}
          currentRoundIndex={0}
          currentRoundName="Preliminary Round"
        />
      )

      expect(screen.getByText("Preliminary Round")).toBeInTheDocument()
    })

    it("should handle double-digit round index", () => {
      render(
        <Pagination
          {...defaultProps}
          currentRoundIndex={15}
          currentRoundName="Regular Season - 15"
        />
      )

      expect(screen.getByText("Regular Season - 15")).toBeInTheDocument()
    })

    it("should handle large round index", () => {
      render(
        <Pagination
          {...defaultProps}
          currentRoundIndex={38}
          currentRoundName="Regular Season - 38"
        />
      )

      expect(screen.getByText("Regular Season - 38")).toBeInTheDocument()
    })

    it("should calculate previous round correctly for round 1", () => {
      mockUsePathname.mockReturnValue("/bolao/123/bet")
      mockUseSearchParams.mockReturnValue(new URLSearchParams(""))

      render(
        <Pagination
          {...defaultProps}
          currentRoundIndex={1}
          isFirstRound={false}
        />
      )

      const links = screen.getAllByRole("link")
      const prevLink = links[0]

      expect(prevLink).toHaveAttribute("href", "/bolao/123/bet?roundIndex=0")
    })

    it("should calculate next round correctly from large index", () => {
      mockUsePathname.mockReturnValue("/bolao/123/bet")
      mockUseSearchParams.mockReturnValue(new URLSearchParams(""))

      render(
        <Pagination
          {...defaultProps}
          currentRoundIndex={37}
          isLastRound={false}
        />
      )

      const links = screen.getAllByRole("link")
      const nextLink = links[1]

      expect(nextLink).toHaveAttribute("href", "/bolao/123/bet?roundIndex=38")
    })
  })

  describe("Layout and Styling", () => {
    it("should have centered flex container", () => {
      const { container } = render(<Pagination {...defaultProps} />)

      const mainDiv = container.firstChild
      expect(mainDiv).toHaveClass(
        "flex",
        "justify-center",
        "mb-4",
        "items-center"
      )
    })
  })

  describe("Edge Cases and Boundary Conditions", () => {
    it("should handle only showing next button", () => {
      render(
        <Pagination
          {...defaultProps}
          currentRoundIndex={1}
          currentRoundName="Round 1"
          isFirstRound={true}
          isLastRound={false}
        />
      )

      const links = screen.getAllByRole("link")
      expect(links).toHaveLength(1)
      expect(links[0]).toHaveAttribute("href", "/bolao/123/bet?roundIndex=2")
    })

    it("should handle only showing previous button", () => {
      render(
        <Pagination
          {...defaultProps}
          currentRoundIndex={10}
          currentRoundName="Regular Season - 10"
          isFirstRound={false}
          isLastRound={true}
        />
      )

      const links = screen.getAllByRole("link")
      expect(links).toHaveLength(1)
      expect(links[0]).toHaveAttribute("href", "/bolao/123/bet?roundIndex=9")
    })

    it("should render correctly with no navigation buttons", () => {
      render(
        <Pagination
          {...defaultProps}
          currentRoundIndex={1}
          currentRoundName="Round 1"
          isFirstRound={true}
          isLastRound={true}
        />
      )

      expect(screen.getByText("Round 1")).toBeInTheDocument()
      expect(screen.queryAllByRole("link")).toHaveLength(0)
    })
  })

  describe("Search Params Handling", () => {
    it("should handle multiple search params", () => {
      mockUsePathname.mockReturnValue("/bolao/123/bet")
      mockUseSearchParams.mockReturnValue(
        new URLSearchParams("param1=value1&param2=value2&param3=value3")
      )

      render(<Pagination {...defaultProps} currentRoundIndex={5} />)

      const links = screen.getAllByRole("link")
      const nextLink = links[1]
      const href = nextLink.getAttribute("href")

      expect(href).toContain("param1=value1")
      expect(href).toContain("param2=value2")
      expect(href).toContain("param3=value3")
      expect(href).toContain("roundIndex=6")
    })

    it("should handle empty search params", () => {
      mockUsePathname.mockReturnValue("/bolao/123/bet")
      mockUseSearchParams.mockReturnValue(new URLSearchParams(""))

      render(<Pagination {...defaultProps} currentRoundIndex={5} />)

      const links = screen.getAllByRole("link")
      expect(links[0]).toHaveAttribute("href", "/bolao/123/bet?roundIndex=4")
      expect(links[1]).toHaveAttribute("href", "/bolao/123/bet?roundIndex=6")
    })

    it("should handle special characters in search params", () => {
      mockUsePathname.mockReturnValue("/bolao/123/bet")
      mockUseSearchParams.mockReturnValue(
        new URLSearchParams("name=test%20value&filter=a%26b")
      )

      render(<Pagination {...defaultProps} currentRoundIndex={3} />)

      const links = screen.getAllByRole("link")
      const href = links[0].getAttribute("href")

      expect(href).toContain("roundIndex=2")
    })
  })

  describe("Button Icons", () => {
    it("should render chevron icons in buttons", () => {
      const { container } = render(<Pagination {...defaultProps} />)

      // Check that SVG icons are present (ChevronLeftIcon and ChevronRightIcon render as SVGs)
      const svgs = container.querySelectorAll("svg")
      expect(svgs.length).toBeGreaterThanOrEqual(2)
    })

    it("should render left chevron in previous button", () => {
      render(<Pagination {...defaultProps} />)

      const links = screen.getAllByRole("link")
      const prevLink = links[0]

      // ChevronLeftIcon should be in the first link
      expect(prevLink.querySelector("svg")).toBeInTheDocument()
    })

    it("should render right chevron in next button", () => {
      render(<Pagination {...defaultProps} />)

      const links = screen.getAllByRole("link")
      const nextLink = links[1]

      // ChevronRightIcon should be in the second link
      expect(nextLink.querySelector("svg")).toBeInTheDocument()
    })
  })
})
