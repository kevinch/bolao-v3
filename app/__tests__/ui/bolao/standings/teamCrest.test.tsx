import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { TeamCrest } from "@/app/ui/bolao/standings/teamCrest"

describe("TeamCrest", () => {
  it("should render team crest image with correct props", () => {
    render(<TeamCrest src="/team-logo.png" alt="Team Logo" />)

    const image = screen.getByRole("img", { name: "Team Logo" })
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute("alt", "Team Logo")
  })

  it("should show fallback when image fails to load", () => {
    render(<TeamCrest src="/broken-image.png" alt="Manchester United's logo" />)

    const image = screen.getByRole("img", { name: "Manchester United's logo" })
    
    // Simulate image error
    fireEvent.error(image)

    // Check for fallback element
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
    expect(screen.getByText("M")).toBeInTheDocument()
  })

  it("should show fallback when src is empty string", () => {
    render(<TeamCrest src="" alt="Team Logo" />)

    // Should not render image
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
    
    // Should show first letter of alt text
    expect(screen.getByText("T")).toBeInTheDocument()
  })

  it("should show fallback with first letter uppercase", () => {
    render(<TeamCrest src="" alt="barcelona fc" />)

    expect(screen.getByText("B")).toBeInTheDocument()
  })

  it("should display correct fallback styling", () => {
    const { container } = render(<TeamCrest src="" alt="Test Team" />)

    const fallback = container.querySelector("div.inline-flex")
    expect(fallback).toBeInTheDocument()
    expect(fallback).toHaveClass("bg-slate-200")
    expect(fallback).toHaveClass("rounded-sm")
  })

  it("should handle alt text starting with special characters", () => {
    render(<TeamCrest src="" alt="'s-Hertogenbosch" />)

    // Should take the first character and uppercase it
    expect(screen.getByText("'")).toBeInTheDocument()
  })

  it("should recover from error state if manually reset", () => {
    const { rerender } = render(
      <TeamCrest src="/broken-image.png" alt="Team Logo" />
    )

    const image = screen.getByRole("img")
    fireEvent.error(image)

    // Now it should show fallback
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
    expect(screen.getByText("T")).toBeInTheDocument()

    // Rerender with different src shouldn't show image (state persists)
    rerender(<TeamCrest src="/new-image.png" alt="Team Logo" />)
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
  })
})
