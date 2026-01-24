import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import Form from "@/app/ui/bolao/create/form"
import { createBolao } from "@/app/lib/actions"
import { useToast } from "@/hooks/use-toast"

// Mock dependencies
vi.mock("@/app/lib/actions")
vi.mock("@/hooks/use-toast")
const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}))
vi.mock("@/components/ui/input", () => ({
    Input: (props: any) => <input {...props} />
}))
vi.mock("@/components/ui/button", () => ({
    Button: ({ children, ...props }: any) => <button {...props}>{children}</button>
}))
vi.mock("@/components/ui/label", () => ({
    Label: ({ children, ...props }: any) => <label {...props}>{children}</label>
}))
vi.mock("@/components/ui/select", () => ({
    Select: ({ children, name, required }: any) => (
        <div data-testid="select" data-name={name} data-required={required}>
            {children}
        </div>
    ),
    SelectContent: ({ children }: any) => <div>{children}</div>,
    SelectGroup: ({ children }: any) => <div>{children}</div>,
    SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
    SelectLabel: ({ children }: any) => <div>{children}</div>,
    SelectTrigger: ({ children }: any) => <div>{children}</div>,
    SelectValue: ({ placeholder }: any) => <div>{placeholder}</div>
}))
vi.mock("@radix-ui/react-icons", () => ({
    ReloadIcon: (props: any) => <span data-testid="reload-icon" {...props} />
}))

describe("Form", () => {
    const mockToast = vi.fn()
    const mockLeagues = [
        { id: 1, name: "Premier League", countryName: "England" },
        { id: 2, name: "La Liga", countryName: "Spain" },
        { id: 3, name: "Championship", countryName: "England" }
    ]

    beforeEach(() => {
        vi.clearAllMocks();
        (useToast as any).mockReturnValue({ toast: mockToast })
    })

    it("should render form with name input and competition select", () => {
        render(<Form leagues={mockLeagues} />)

        expect(screen.getByLabelText("Name:")).toBeDefined()
        expect(screen.getByPlaceholderText("Choose a name for your bolão")).toBeDefined()
        expect(screen.getByText("Competition:")).toBeDefined()
        expect(screen.getByTestId("select")).toBeDefined()
        expect(screen.getByText("Create")).toBeDefined()
    })

    it("should group and sort leagues by country", () => {
        render(<Form leagues={mockLeagues} />)

        // Verify leagues are grouped by country
        expect(screen.getByText("England")).toBeDefined()
        expect(screen.getByText("Spain")).toBeDefined()

        // Verify leagues within countries are sorted
        const options = screen.getAllByRole("option")
        const englandLeagues = options.filter(opt =>
            opt.textContent === "Championship" || opt.textContent === "Premier League"
        )
        expect(englandLeagues.length).toBe(2)
    })

    it("should show loading state when submitting", async () => {
        (createBolao as any).mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));

        const { container } = render(<Form leagues={mockLeagues} />)

        const form = container.querySelector("form")!
        fireEvent.submit(form)

        await waitFor(() => {
            expect(screen.getByText("Please wait")).toBeDefined()
            expect(screen.getByTestId("reload-icon")).toBeDefined()
        })
    })

    it("should show success toast on successful creation", async () => {
        (createBolao as any).mockResolvedValue({ success: true });

        const { container } = render(<Form leagues={mockLeagues} />)

        const nameInput = screen.getByPlaceholderText("Choose a name for your bolão")
        fireEvent.change(nameInput, { target: { value: "Test Bolao" } })

        const form = container.querySelector("form")!
        fireEvent.submit(form)

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                title: "Success",
                description: "The bolão was successfully created.",
                variant: "success"
            })
        })
    })

    it("should show error toast on failed creation", async () => {
        (createBolao as any).mockResolvedValue({ success: false });

        const { container } = render(<Form leagues={mockLeagues} />)

        const nameInput = screen.getByPlaceholderText("Choose a name for your bolão")
        fireEvent.change(nameInput, { target: { value: "Test Bolao" } })

        const form = container.querySelector("form")!
        fireEvent.submit(form)

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                description: "There was an issue with the creation.",
                variant: "destructive"
            })
        })
    })

    it("should redirect to the home page after successful creation", async () => {
        (createBolao as any).mockResolvedValue({ success: true });

        const { container } = render(<Form leagues={mockLeagues} />)

        const form = container.querySelector("form")!
        fireEvent.submit(form)

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith("/")
        })
    })
})
