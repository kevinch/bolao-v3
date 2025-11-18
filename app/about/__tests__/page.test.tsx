import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import About from "../page"

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

describe("About Page", () => {
  describe("Component Rendering", () => {
    it("should render without crashing", () => {
      render(<About />)

      expect(screen.getByText("About")).toBeInTheDocument()
    })

    it("should render PageTitle with center prop", () => {
      render(<About />)

      const pageTitle = screen.getByTestId("page-title")
      expect(pageTitle).toBeInTheDocument()
      expect(pageTitle).toHaveAttribute("data-center", "true")
    })

    it("should render main heading", () => {
      render(<About />)

      const heading = screen.getByRole("heading", { level: 1, name: "About" })
      expect(heading).toBeInTheDocument()
    })
  })

  describe("Section Headings", () => {
    it("should render 'Bolão?' section heading", () => {
      render(<About />)

      const heading = screen.getByRole("heading", {
        level: 2,
        name: "Bolão?",
      })
      expect(heading).toBeInTheDocument()
    })

    it("should render 'Who's behind this?' section heading", () => {
      render(<About />)

      const heading = screen.getByRole("heading", {
        level: 2,
        name: "Who's behind this?",
      })
      expect(heading).toBeInTheDocument()
    })

    it("should render 'On the tech side' section heading", () => {
      render(<About />)

      const heading = screen.getByRole("heading", {
        level: 2,
        name: "On the tech side",
      })
      expect(heading).toBeInTheDocument()
    })

    it("should have correct styling classes on section headings", () => {
      const { container } = render(<About />)

      const headings = container.querySelectorAll("h2")
      headings.forEach((heading) => {
        expect(heading.className).toBe("text-2xl mb-6 text-center")
      })
    })
  })

  describe("Bolão Section", () => {
    it("should explain what a bolão is", () => {
      render(<About />)

      expect(
        screen.getByText(/In Brazil, a bolão is a betting pool/i)
      ).toBeInTheDocument()
    })

    it("should mention soccer championships", () => {
      render(<About />)

      expect(
        screen.getByText(/betting pool between friends usually around/i)
      ).toBeInTheDocument()
    })

    it("should mention World Cup", () => {
      render(<About />)

      expect(
        screen.getByText(
          /It is very popular during the World Cup and other major tournaments/i
        )
      ).toBeInTheDocument()
    })

    it("should render pronunciation wiki link", () => {
      render(<About />)

      const link = screen.getByRole("link", { name: /wiki page/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute(
        "href",
        "https://en.wiktionary.org/wiki/bol%C3%A3o"
      )
    })

    it("should have underline hover styling on wiki link", () => {
      render(<About />)

      const link = screen.getByRole("link", { name: /wiki page/i })
      expect(link).toHaveClass("underline", "hover:no-underline")
    })

    it("should explain the history since 2016", () => {
      render(<About />)

      expect(
        screen.getByText(
          /We started around 2016 doing them on a piece of paper/i
        )
      ).toBeInTheDocument()
    })

    it("should mention it doesn't involve money", () => {
      render(<About />)

      expect(
        screen.getByText(
          /It does not involve money even if most friends like to agree on a prize/i
        )
      ).toBeInTheDocument()
    })

    it("should explain the app doesn't deal with money", () => {
      render(<About />)

      expect(
        screen.getByText(/But that's something the app does not deal with/i)
      ).toBeInTheDocument()
    })
  })

  describe("Development History Section", () => {
    it("should mention research of existing solutions", () => {
      render(<About />)

      expect(
        screen.getByText(/After much research of existing solutions/i)
      ).toBeInTheDocument()
    })

    it("should mention UX, design and functionality", () => {
      render(<About />)

      expect(
        screen.getByText(/none of them was what I expected in terms of UX/i)
      ).toBeInTheDocument()
    })

    it("should mention starting to code around 2017", () => {
      render(<About />)

      expect(
        screen.getByText(/That's when I started writing code, around 2017/i)
      ).toBeInTheDocument()
    })

    it("should mention app evolution", () => {
      render(<About />)

      expect(
        screen.getByText(/The app has been growing ever since/i)
      ).toBeInTheDocument()
    })

    it("should mention version 3", () => {
      render(<About />)

      expect(
        screen.getByText(/This very version your are on is the major 3/i)
      ).toBeInTheDocument()
    })

    it("should mention third iteration", () => {
      render(<About />)

      expect(
        screen.getByText(/or the third big iteration of the application/i)
      ).toBeInTheDocument()
    })
  })

  describe("Who's Behind This Section", () => {
    it("should mention it's a one person project", () => {
      render(<About />)

      expect(
        screen.getByText(/This is a one person project/i)
      ).toBeInTheDocument()
    })

    it("should mention Kevin", () => {
      render(<About />)

      expect(screen.getByText(/My name is Kevin/i)).toBeInTheDocument()
    })

    it("should mention software developer", () => {
      render(<About />)

      expect(
        screen.getByText(/I'm a software developer and former web designer/i)
      ).toBeInTheDocument()
    })

    it("should mention Rio de Janeiro", () => {
      render(<About />)

      expect(
        screen.getByText(/living in Rio de Janeiro - Brazil/i)
      ).toBeInTheDocument()
    })

    it("should render LinkedIn link", () => {
      render(<About />)

      const link = screen.getByRole("link", { name: /LinkedIn/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute(
        "href",
        "https://www.linkedin.com/in/kevinchevallier/"
      )
    })

    it("should have underline hover styling on LinkedIn link", () => {
      render(<About />)

      const link = screen.getByRole("link", { name: /LinkedIn/i })
      expect(link).toHaveClass("underline", "hover:no-underline")
    })
  })

  describe("Tech Section", () => {
    it("should mention it's a web app", () => {
      render(<About />)

      expect(
        screen.getByText(/this is a web app, which means no Android or IOs/i)
      ).toBeInTheDocument()
    })

    it("should mention no app download needed", () => {
      render(<About />)

      expect(screen.getByText(/extra app to download/i)).toBeInTheDocument()
    })

    it("should mention bolao.io URL", () => {
      render(<About />)

      expect(
        screen.getByText(/Just open your browser at https:\/\/bolao.io/i)
      ).toBeInTheDocument()
    })

    it("should mention continuous updates", () => {
      render(<About />)

      expect(
        screen.getByText(
          /This allows me to constantly roll out changes without the users having to update/i
        )
      ).toBeInTheDocument()
    })

    it("should mention NextJS", () => {
      render(<About />)

      expect(
        screen.getByText(/The app is built with NextJS/i)
      ).toBeInTheDocument()
    })

    it("should mention TypeScript", () => {
      render(<About />)

      expect(screen.getByText(/Typescript and React/i)).toBeInTheDocument()
    })

    it("should mention React", () => {
      render(<About />)

      expect(screen.getByText(/Typescript and React/i)).toBeInTheDocument()
    })

    it("should mention Vercel", () => {
      render(<About />)

      expect(screen.getByText(/hosted at Vercel/i)).toBeInTheDocument()
    })

    it("should mention Postgres", () => {
      render(<About />)

      expect(
        screen.getByText(/uses Postgres for the database/i)
      ).toBeInTheDocument()
    })

    it("should mention Prismic.io", () => {
      render(<About />)

      expect(
        screen.getByText(/It uses Prismic.io for the headless CMS/i)
      ).toBeInTheDocument()
    })

    it("should mention Clerk", () => {
      render(<About />)

      expect(
        screen.getByText(/Clerk for the auth management/i)
      ).toBeInTheDocument()
    })
  })

  describe("Layout and Styling", () => {
    it("should have correct paragraph styling classes", () => {
      const { container } = render(<About />)

      const paragraphs = container.querySelectorAll("p")
      paragraphs.forEach((p) => {
        expect(p.className).toBe("mb-10")
      })
    })

    it("should render all external links", () => {
      render(<About />)

      const links = screen.getAllByRole("link")
      expect(links).toHaveLength(2) // Wiki and LinkedIn
    })

    it("should have all links with proper href attributes", () => {
      render(<About />)

      const links = screen.getAllByRole("link")
      links.forEach((link) => {
        expect(link).toHaveAttribute("href")
        expect(link.getAttribute("href")).toMatch(/^https:\/\//)
      })
    })

    it("should wrap content in a div", () => {
      const { container } = render(<About />)

      const wrapper = container.querySelector("div > div")
      expect(wrapper).toBeInTheDocument()
    })
  })

  describe("Content Structure", () => {
    it("should have 3 h2 headings", () => {
      render(<About />)

      const headings = screen.getAllByRole("heading", { level: 2 })
      expect(headings).toHaveLength(3)
    })

    it("should have 1 h1 heading", () => {
      render(<About />)

      const headings = screen.getAllByRole("heading", { level: 1 })
      expect(headings).toHaveLength(1)
    })

    it("should have 6 paragraphs", () => {
      const { container } = render(<About />)

      const paragraphs = container.querySelectorAll("p")
      expect(paragraphs).toHaveLength(6)
    })

    it("should have sections in correct order", () => {
      render(<About />)

      const headings = screen.getAllByRole("heading", { level: 2 })
      expect(headings[0]).toHaveTextContent("Bolão?")
      expect(headings[1]).toHaveTextContent("Who's behind this?")
      expect(headings[2]).toHaveTextContent("On the tech side")
    })
  })

  describe("Accessibility", () => {
    it("should use semantic HTML with proper heading hierarchy", () => {
      render(<About />)

      const h1 = screen.getByRole("heading", { level: 1 })
      const h2s = screen.getAllByRole("heading", { level: 2 })

      expect(h1).toBeInTheDocument()
      expect(h2s).toHaveLength(3)
    })

    it("should have descriptive link text", () => {
      render(<About />)

      const links = screen.getAllByRole("link")
      links.forEach((link) => {
        expect(link.textContent).toBeTruthy()
        expect(link.textContent?.length).toBeGreaterThan(0)
      })
    })

    it("should have all links accessible via keyboard", () => {
      render(<About />)

      const links = screen.getAllByRole("link")
      links.forEach((link) => {
        expect(link).toBeInTheDocument()
      })
    })
  })

  describe("Edge Cases", () => {
    it("should handle rendering with no props", () => {
      expect(() => render(<About />)).not.toThrow()
    })

    it("should render all text content properly", () => {
      const { container } = render(<About />)

      const textContent = container.textContent
      expect(textContent).toBeTruthy()
      expect(textContent?.length).toBeGreaterThan(0)
    })
  })
})
