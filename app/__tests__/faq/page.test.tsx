import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import Faq, { generateMetadata } from "@/app/faq/page"

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

describe("Faq page", () => {
  describe("generateMetadata", () => {
    it("returns FAQ metadata with canonical URL", async () => {
      const metadata = await generateMetadata()

      expect(metadata.title).toBe("FAQ — Creating a free bolão")
      expect(metadata.description).toBe(
        "Answers to common questions about Bolão.io: what a bolão is, how to create a free soccer betting pool with friends, how scoring works and which competitions are covered."
      )
      expect(metadata.alternates).toEqual({ canonical: "/faq" })
    })
  })

  describe("Faq", () => {
    it("renders the page title and all FAQ sections", async () => {
      const page = await Faq()
      render(page)

      expect(screen.getByTestId("page-title")).toHaveAttribute("data-center", "true")
      expect(
        screen.getByRole("heading", { level: 1, name: "Frequently Asked Questions" })
      ).toBeInTheDocument()

      expect(screen.getByRole("heading", { level: 2, name: "What is a bolão?" })).toBeInTheDocument()
      expect(
        screen.getByRole("heading", {
          level: 2,
          name: "How do I create a free bolão online?",
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole("heading", { level: 2, name: "Is Bolão.io really free?" })
      ).toBeInTheDocument()
      expect(
        screen.getByRole("heading", { level: 2, name: "How do friends join my bolão?" })
      ).toBeInTheDocument()
      expect(
        screen.getByRole("heading", { level: 2, name: "How does the scoring work?" })
      ).toBeInTheDocument()
      expect(
        screen.getByRole("heading", {
          level: 2,
          name: "Which competitions are supported?",
        })
      ).toBeInTheDocument()
    })

    it("renders plain-text answers for non-scoring questions", async () => {
      const page = await Faq()
      render(page)

      expect(
        screen.getByText(/A bolão is a Brazilian-style prediction pool/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Create a free account at bolao\.io/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Bolão\.io covers major competitions/)
      ).toBeInTheDocument()
    })

    it("renders scoring tiers as a list for question 5", async () => {
      const page = await Faq()
      render(page)

      expect(
        screen.getByText(
          "You earn points for each match prediction. The highest matching rule applies:"
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText("200 pts — Exact score (e.g. result 3-0, your bet 3-0)")
      ).toBeInTheDocument()
      expect(
        screen.getByText("80 pts — Winner only (e.g. result 1-0, your bet 3-2)")
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          "Pick the championship winner for a one-time +500 pt bonus added to your leaderboard total."
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText("The leaderboard updates automatically as results come in.")
      ).toBeInTheDocument()

      const scoringList = screen.getByRole("list")
      expect(scoringList.querySelectorAll("li")).toHaveLength(6)
    })

    it("includes FAQPage JSON-LD with all questions", async () => {
      const page = await Faq()
      const { container } = render(page)

      const script = container.querySelector('script[type="application/ld+json"]')
      expect(script).not.toBeNull()

      const jsonLd = JSON.parse(script!.textContent ?? "")

      expect(jsonLd).toMatchObject({
        "@context": "https://schema.org",
        "@type": "FAQPage",
      })
      expect(jsonLd.mainEntity).toHaveLength(6)
      expect(jsonLd.mainEntity[0]).toMatchObject({
        "@type": "Question",
        name: "What is a bolão?",
        acceptedAnswer: {
          "@type": "Answer",
          text: expect.stringContaining("Brazilian-style prediction pool"),
        },
      })
      expect(jsonLd.mainEntity[4].name).toBe("How does the scoring work?")
      expect(jsonLd.mainEntity[4].acceptedAnswer.text).toContain("200 pts — Exact score")
      expect(jsonLd.mainEntity[4].acceptedAnswer.text).toContain(
        "The leaderboard updates automatically as results come in."
      )
    })
  })
})
