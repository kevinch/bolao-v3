import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { BoloesListSkeleton, TableSkeleton, BolaoPagesSkeleton } from "@/app/ui/skeletons"

describe("Skeletons", () => {
    describe("BoloesListSkeleton", () => {
        it("should render three skeleton cards", () => {
            const { container } = render(<BoloesListSkeleton />)

            // Should have 3 cards with animate-pulse
            const skeletonCards = container.querySelectorAll(".animate-pulse")
            expect(skeletonCards.length).toBe(3)
        })
    })

    describe("TableSkeleton", () => {
        it("should render table skeleton with multiple lines", () => {
            const { container } = render(<TableSkeleton />)

            // Should have animate-pulse container
            const animatedContainer = container.querySelector(".animate-pulse")
            expect(animatedContainer).toBeDefined()

            // Should have 7 skeleton lines
            const skeletonLines = container.querySelectorAll(".h-6.rounded-md.bg-gray-200.mb-4")
            expect(skeletonLines.length).toBe(7)
        })
    })

    describe("BolaoPagesSkeleton", () => {
        it("should render complete bolao page skeleton with all components", () => {
            const { container } = render(<BolaoPagesSkeleton />)

            // Should have multiple animate-pulse elements (PageTitle, Tabs, Pagination, Table)
            const animatedElements = container.querySelectorAll(".animate-pulse")
            expect(animatedElements.length).toBeGreaterThan(0)

            // Should have page title skeleton (rounded-full for logo)
            const logoSkeleton = container.querySelector(".rounded-full")
            expect(logoSkeleton).toBeDefined()

            // Should have table skeleton
            const tableSkeleton = container.querySelector(".bg-gray-100.p-4.shadow-sm")
            expect(tableSkeleton).toBeDefined()
        })
    })
})
