// import React from "react"
import { screen } from "@testing-library/dom"
import { render } from "@testing-library/react"
import Footer from "../footer"

describe("Footer", () => {
  it("should render 8 links", () => {
    render(<Footer />)

    // Check for all 5 links by their text content
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Create" })
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "News" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "FAQ" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Contact" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Privacy" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Terms" })).toBeInTheDocument()

    // Verify there are exactly 8 links
    const links = screen.getAllByRole("link")
    expect(links).toHaveLength(8)
  })

  it("should have correct href attributes for all links", () => {
    render(<Footer />)

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/"
    )
    expect(screen.getByRole("link", { name: "Create" })).toHaveAttribute(
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
    expect(screen.getByRole("link", { name: "FAQ" })).toHaveAttribute(
      "href",
      "/faq"
    )
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "/contact"
    )
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute(
      "href",
      "/privacy"
    )
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute(
      "href",
      "/terms"
    )
  })

  it("labels universal preferences", () => {
    render(<Footer />)

    expect(
      screen.getByRole("button", { name: "Switch language" })
    ).toHaveTextContent("English")
    expect(
      screen.getByRole("button", { name: "Toggle appearance" })
    ).toHaveTextContent("Light")
  })
})
