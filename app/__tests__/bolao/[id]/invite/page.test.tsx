import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import InvitePage from "@/app/bolao/[id]/invite/page"
import { fetchBolao, fetchUserBolao } from "@/app/lib/data"
import { createUserBolao } from "@/app/lib/actions"
import { auth } from "@clerk/nextjs/server"

// Mock dependencies
vi.mock("@/app/lib/data")
vi.mock("@/app/lib/actions")
vi.mock("@clerk/nextjs/server")
vi.mock("@/app/components/pageTitle", () => ({
    default: ({ children }: { children: React.ReactNode }) => <h1 data-testid="page-title">{children}</h1>
}))
vi.mock("@/components/ui/button", () => ({
    Button: ({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) => (
        <span data-testid="button" data-as-child={asChild}>{children}</span>
    )
}))

describe("InvitePage", () => {
    const mockParams = Promise.resolve({ id: "bolao-123" })
    const mockBolao = { id: "bolao-123", name: "Test Bolao" }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("should render error if userId is missing", async () => {
        (auth as any).mockResolvedValue({ userId: null })

        const result = await InvitePage({ params: mockParams })
        render(result)

        expect(screen.getByText("Error while loading the bolão. Missing userid")).toBeDefined()
    })

    it("should show 'already in bolao' message if user is already a member", async () => {
        (auth as any).mockResolvedValue({ userId: "user-123" });
        (fetchBolao as any).mockResolvedValue(mockBolao);
        (fetchUserBolao as any).mockResolvedValue({ id: "user-bolao-123" });

        const result = await InvitePage({ params: mockParams })
        render(result)

        expect(screen.getByText("You are already in the bolão.")).toBeDefined()
        expect(screen.getByText(/Test Bolao/)).toBeDefined()
        expect(createUserBolao).not.toHaveBeenCalled()
    })

    it("should attempt to add user and show success message", async () => {
        (auth as any).mockResolvedValue({ userId: "user-123" });
        (fetchBolao as any).mockResolvedValue(mockBolao);
        (fetchUserBolao as any).mockResolvedValue(null);
        (createUserBolao as any).mockResolvedValue({ success: true });

        const result = await InvitePage({ params: mockParams })
        render(result)

        expect(screen.getByText("You were added to the bolão with success.")).toBeDefined()
        expect(createUserBolao).toHaveBeenCalledWith("bolao-123")
    })

    it("should attempt to add user and show error message on failure", async () => {
        (auth as any).mockResolvedValue({ userId: "user-123" });
        (fetchBolao as any).mockResolvedValue(mockBolao);
        (fetchUserBolao as any).mockResolvedValue(null);
        (createUserBolao as any).mockResolvedValue({ success: false });

        const result = await InvitePage({ params: mockParams })
        render(result)

        expect(screen.getByText("Something went wrong while adding you to the bolão.")).toBeDefined()
        expect(createUserBolao).toHaveBeenCalledWith("bolao-123")
    })
})
