// import React from "react"
import { screen } from "@testing-library/dom"
import { render } from "@testing-library/react"
import Footer from "../footer"

describe("Footer", () => {
  it("should render 4 links", () => {
    render(<Footer />)

    // Check for all 4 links by their text content
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Create bolão" })
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "News" })).toBeInTheDocument()

    // Verify there are exactly 4 links
    const links = screen.getAllByRole("link")
    expect(links).toHaveLength(4)
  })

  it("should have correct href attributes for all links", () => {
    render(<Footer />)

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/"
    )
    expect(screen.getByRole("link", { name: "Create bolão" })).toHaveAttribute(
      "href",
      "/bolao/create"
    )
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "/about"
    )
    expect(screen.getByRole("link", { name: "News" })).toHaveAttribute(
      "href",
      "/news"
    )
  })
})
