import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import Page from "@/app/sign-in/[[...sign-in]]/page"
import { useSearchParams } from "next/navigation"
import { SESSION_STORAGE_INVITE_KEY } from "@/app/lib/utils"

// Mock dependencies
vi.mock("next/navigation", () => ({
    useSearchParams: vi.fn()
}))
vi.mock("@clerk/nextjs", () => ({
    SignIn: () => <div data-testid="clerk-sign-in">SignIn Component</div>
}))
vi.mock("@/app/components/pageTitle", () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="page-title">{children}</div>
    )
}))

describe("SignIn Page", () => {
    const mockSearchParams = {
        get: vi.fn()
    }

    beforeEach(() => {
        vi.clearAllMocks()
        // Mock sessionStorage
        Object.defineProperty(window, 'sessionStorage', {
            value: {
                getItem: vi.fn(),
                setItem: vi.fn(),
                removeItem: vi.fn(),
                clear: vi.fn()
            },
            writable: true
        })
    })

    it("should render sign-in page with PageTitle and SignIn component", () => {
        (useSearchParams as any).mockReturnValue(mockSearchParams);
        mockSearchParams.get.mockReturnValue(null);

        render(<Page />)

        expect(screen.getByTestId("page-title")).toBeDefined()
        expect(screen.getByText("Login")).toBeDefined()
        expect(screen.getByTestId("clerk-sign-in")).toBeDefined()
    })

    it("should store redirect_url in sessionStorage when it ends with 'invite'", () => {
        const redirectUrl = "/bolao/123/invite"
        mockSearchParams.get.mockReturnValue(redirectUrl);
        (useSearchParams as any).mockReturnValue(mockSearchParams);

        render(<Page />)

        // Wait for useEffect to run
        expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
            SESSION_STORAGE_INVITE_KEY,
            redirectUrl
        )
    })

    it("should not store redirect_url in sessionStorage when it does not end with 'invite'", () => {
        const redirectUrl = "/bolao/123/bet"
        mockSearchParams.get.mockReturnValue(redirectUrl);
        (useSearchParams as any).mockReturnValue(mockSearchParams);

        render(<Page />)

        expect(window.sessionStorage.setItem).not.toHaveBeenCalled()
    })

    it("should not store redirect_url in sessionStorage when redirect_url is null", () => {
        mockSearchParams.get.mockReturnValue(null);
        (useSearchParams as any).mockReturnValue(mockSearchParams);

        render(<Page />)

        expect(window.sessionStorage.setItem).not.toHaveBeenCalled()
    })
})
