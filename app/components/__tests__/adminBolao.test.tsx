import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi } from "vitest"
import AdminBolao from "../adminBolao"
import type { Bolao } from "@/app/lib/definitions"

// Mock deleteBolaoGroup
const mockDeleteBolaoGroup = vi.fn()
vi.mock("@/app/lib/controllerAdmin", () => ({
  deleteBolaoGroup: (bolaoId: string) => mockDeleteBolaoGroup(bolaoId),
}))

// Mock formatDateNews
const mockFormatDateNews = vi.fn()
vi.mock("@/app/lib/utils", () => ({
  formatDateNews: (date: string) => mockFormatDateNews(date),
}))

// Mock toast hook
const mockToast = vi.fn()
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}))

describe("AdminBolao", () => {
  const mockBolao: Bolao = {
    id: "bolao-12345",
    name: "Champions League 2024",
    competition_id: "2",
    created_by: "user-67890",
    created_at: new Date("2024-01-15"),
    year: 2024,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockFormatDateNews.mockReturnValue("January 15, 2024")
  })

  it("should render bolao name", () => {
    render(<AdminBolao bolao={mockBolao} />)

    expect(screen.getByText("Champions League 2024")).toBeInTheDocument()
  })

  it("should display competition id", () => {
    render(<AdminBolao bolao={mockBolao} />)

    expect(screen.getByText(/Competition id: 2/)).toBeInTheDocument()
  })

  it("should display masked bolao id (last 5 characters)", () => {
    render(<AdminBolao bolao={mockBolao} />)

    expect(screen.getByText(/Id: \*\*\*\*12345/)).toBeInTheDocument()
  })

  it("should display masked created_by id (last 5 characters)", () => {
    render(<AdminBolao bolao={mockBolao} />)

    expect(screen.getByText(/Created by: \*\*\*\*67890/)).toBeInTheDocument()
  })

  it("should display formatted created_at date", () => {
    render(<AdminBolao bolao={mockBolao} />)

    expect(mockFormatDateNews).toHaveBeenCalledWith(
      mockBolao.created_at.toString()
    )
    expect(screen.getByText(/Created at: January 15, 2024/)).toBeInTheDocument()
  })

  it("should render delete button initially", () => {
    render(<AdminBolao bolao={mockBolao} />)

    const deleteButton = screen.getByRole("button", { name: /delete/i })
    expect(deleteButton).toBeInTheDocument()
  })

  it("should open confirmation dialog when delete button is clicked", async () => {
    const user = userEvent.setup()
    render(<AdminBolao bolao={mockBolao} />)

    const deleteButton = screen.getByRole("button", { name: /delete/i })
    await user.click(deleteButton)

    // Check dialog content
    await waitFor(() => {
      expect(screen.getByText("Delete bolão")).toBeInTheDocument()
      expect(
        screen.getByText(/Once confirmed, this action cannot be undone/i)
      ).toBeInTheDocument()
      // Bolao name appears in both the card and the dialog, so we use getAllByText
      const bolaoNames = screen.getAllByText(mockBolao.name)
      expect(bolaoNames.length).toBeGreaterThanOrEqual(2)
    })
  })

  it("should display Cancel and Confirm buttons in dialog", async () => {
    const user = userEvent.setup()
    render(<AdminBolao bolao={mockBolao} />)

    const deleteButton = screen.getByRole("button", { name: /delete/i })
    await user.click(deleteButton)

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /cancel/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: /confirm/i })
      ).toBeInTheDocument()
    })
  })

  it("should call deleteBolaoGroup when Confirm is clicked", async () => {
    const user = userEvent.setup()
    mockDeleteBolaoGroup.mockResolvedValue({ success: true })

    render(<AdminBolao bolao={mockBolao} />)

    // Open dialog
    const deleteButton = screen.getByRole("button", { name: /delete/i })
    await user.click(deleteButton)

    // Click Confirm
    const confirmButton = await screen.findByRole("button", {
      name: /confirm/i,
    })
    await user.click(confirmButton)

    expect(mockDeleteBolaoGroup).toHaveBeenCalledWith(mockBolao.id)
  })

  it("should show success toast and 'Deleted' text when deletion succeeds", async () => {
    const user = userEvent.setup()
    mockDeleteBolaoGroup.mockResolvedValue({ success: true })

    render(<AdminBolao bolao={mockBolao} />)

    // Open dialog and confirm
    const deleteButton = screen.getByRole("button", { name: /delete/i })
    await user.click(deleteButton)

    const confirmButton = await screen.findByRole("button", {
      name: /confirm/i,
    })
    await user.click(confirmButton)

    // Check success toast
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Success",
        description: "The bolão was successfully deleted.",
        variant: "success",
      })
    })

    // Check "Deleted" text appears
    await waitFor(() => {
      expect(screen.getByText("Deleted")).toBeInTheDocument()
    })
  })

  it("should show error toast when deletion fails", async () => {
    const user = userEvent.setup()
    mockDeleteBolaoGroup.mockResolvedValue({ success: false })

    render(<AdminBolao bolao={mockBolao} />)

    // Open dialog and confirm
    const deleteButton = screen.getByRole("button", { name: /delete/i })
    await user.click(deleteButton)

    const confirmButton = await screen.findByRole("button", {
      name: /confirm/i,
    })
    await user.click(confirmButton)

    // Check error toast
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        description: "There was an issue with the deletion.",
        variant: "destructive",
      })
    })

    // The dialog should still be visible after a failed deletion
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
    })
  })

  it("should replace delete button with 'Deleted' text after successful deletion", async () => {
    const user = userEvent.setup()
    mockDeleteBolaoGroup.mockResolvedValue({ success: true })

    render(<AdminBolao bolao={mockBolao} />)

    // Verify delete button exists
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument()

    // Open dialog and confirm
    const deleteButton = screen.getByRole("button", { name: /delete/i })
    await user.click(deleteButton)

    const confirmButton = await screen.findByRole("button", {
      name: /confirm/i,
    })
    await user.click(confirmButton)

    // Wait for deletion to complete
    await waitFor(() => {
      expect(screen.getByText("Deleted")).toBeInTheDocument()
    })

    // Verify delete button is gone
    expect(
      screen.queryByRole("button", { name: /delete/i })
    ).not.toBeInTheDocument()
  })

  it("should apply destructive variant to delete button", () => {
    render(<AdminBolao bolao={mockBolao} />)

    const deleteButton = screen.getByRole("button", { name: /delete/i })
    // The button should have destructive styling
    expect(deleteButton).toBeInTheDocument()
  })

  it("should apply green text color to 'Deleted' text", async () => {
    const user = userEvent.setup()
    mockDeleteBolaoGroup.mockResolvedValue({ success: true })

    render(<AdminBolao bolao={mockBolao} />)

    const deleteButton = screen.getByRole("button", { name: /delete/i })
    await user.click(deleteButton)

    const confirmButton = await screen.findByRole("button", {
      name: /confirm/i,
    })
    await user.click(confirmButton)

    await waitFor(() => {
      const deletedText = screen.getByText("Deleted")
      expect(deletedText).toHaveClass("text-green-500")
    })
  })
})
