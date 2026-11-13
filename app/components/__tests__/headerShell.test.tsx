import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach } from "vitest"

import HeaderShell from "../headerShell"

function setScrollY(value: number) {
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    writable: true,
    value,
  })
}

afterEach(() => {
  setScrollY(0)
})

describe("HeaderShell", () => {
  it("renders its children inside a banner landmark", () => {
    render(
      <HeaderShell>
        <span>Header content</span>
      </HeaderShell>
    )

    const header = screen.getByRole("banner")
    expect(header).toBeInTheDocument()
    expect(screen.getByText("Header content")).toBeInTheDocument()
  })

  it("does not show the shadow when the page is at the top", () => {
    setScrollY(0)
    render(<HeaderShell>content</HeaderShell>)

    expect(screen.getByRole("banner")).not.toHaveClass("shadow-sm")
  })

  it("shows the shadow once the page is scrolled away from the top", () => {
    render(<HeaderShell>content</HeaderShell>)

    act(() => {
      setScrollY(100)
      fireEvent.scroll(window)
    })

    expect(screen.getByRole("banner")).toHaveClass("shadow-sm")
  })

  it("removes the shadow again when scrolled back to the top", () => {
    render(<HeaderShell>content</HeaderShell>)

    act(() => {
      setScrollY(100)
      fireEvent.scroll(window)
    })
    expect(screen.getByRole("banner")).toHaveClass("shadow-sm")

    act(() => {
      setScrollY(0)
      fireEvent.scroll(window)
    })
    expect(screen.getByRole("banner")).not.toHaveClass("shadow-sm")
  })

  it("reflects the initial scroll position on mount", () => {
    setScrollY(250)
    render(<HeaderShell>content</HeaderShell>)

    expect(screen.getByRole("banner")).toHaveClass("shadow-sm")
  })
})
