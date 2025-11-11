import { render, screen } from "@testing-library/react"
import PageTitle from "../pageTitle"

describe("PageTitle", () => {
  it("should render children content", () => {
    render(<PageTitle>Test Title</PageTitle>)

    expect(screen.getByText("Test Title")).toBeInTheDocument()
  })

  it("should apply text-center class when center prop is true", () => {
    render(<PageTitle center>Centered Title</PageTitle>)

    const titleDiv = screen.getByText("Centered Title")
    expect(titleDiv).toHaveClass("text-center")
  })

  it("should not apply text-center class when center prop is false", () => {
    render(<PageTitle center={false}>Left Aligned Title</PageTitle>)

    const titleDiv = screen.getByText("Left Aligned Title")
    expect(titleDiv).not.toHaveClass("text-center")
  })

  it("should not apply text-center class when center prop is not provided", () => {
    render(<PageTitle>Default Title</PageTitle>)

    const titleDiv = screen.getByText("Default Title")
    expect(titleDiv).not.toHaveClass("text-center")
  })

  it("should render subtitle when subTitle prop is provided (string)", () => {
    render(<PageTitle subTitle="This is a subtitle">Main Title</PageTitle>)

    expect(screen.getByText("Main Title")).toBeInTheDocument()
    expect(screen.getByText("This is a subtitle")).toBeInTheDocument()
  })

  it("should render subtitle when subTitle prop is a number", () => {
    render(<PageTitle subTitle={2024}>Main Title</PageTitle>)

    expect(screen.getByText("Main Title")).toBeInTheDocument()
    expect(screen.getByText("2024")).toBeInTheDocument()
  })

  it("should not render subtitle when subTitle prop is not provided", () => {
    const { container } = render(<PageTitle>Main Title</PageTitle>)

    expect(screen.getByText("Main Title")).toBeInTheDocument()

    // Check that there's only one div with text (the main title)
    const textDivs = container.querySelectorAll("div.text-4xl")
    expect(textDivs).toHaveLength(1)
  })

  it("should center both title and subtitle when center is true", () => {
    render(
      <PageTitle center subTitle="Centered Subtitle">
        Centered Title
      </PageTitle>
    )

    const titleDiv = screen.getByText("Centered Title")
    const subtitleDiv = screen.getByText("Centered Subtitle")

    expect(titleDiv).toHaveClass("text-center")
    expect(subtitleDiv).toHaveClass("text-center")
  })

  it("should render complex children (JSX elements)", () => {
    render(
      <PageTitle>
        <span>Complex</span>
        <strong>Title</strong>
      </PageTitle>
    )

    expect(screen.getByText("Complex")).toBeInTheDocument()
    expect(screen.getByText("Title")).toBeInTheDocument()
  })
})
