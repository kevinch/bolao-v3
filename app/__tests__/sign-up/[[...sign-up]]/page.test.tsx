import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import Page from "@/app/sign-up/[[...sign-up]]/page"

// Mock dependencies
vi.mock("@clerk/nextjs", () => ({
    SignUp: () => <div data-testid="clerk-sign-up">SignUp Component</div>
}))
vi.mock("@/app/components/pageTitle", () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="page-title">{children}</div>
    )
}))

describe("SignUp Page", () => {
    it("should render sign-up page with PageTitle and SignUp component", () => {
        render(<Page />)

        expect(screen.getByTestId("page-title")).toBeDefined()
        expect(screen.getByText("Register")).toBeDefined()
        expect(screen.getByTestId("clerk-sign-up")).toBeDefined()
    })
})
