import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import Loading from "@/app/bolao/[id]/loading"

// Mock dependencies
vi.mock("@/app/ui/skeletons", () => ({
    BolaoPagesSkeleton: () => <div data-testid="bolao-pages-skeleton">Loading...</div>
}))

describe("Loading", () => {
    it("should render BolaoPagesSkeleton", () => {
        render(<Loading />)

        expect(screen.getByTestId("bolao-pages-skeleton")).toBeDefined()
        expect(screen.getByText("Loading...")).toBeDefined()
    })
})
