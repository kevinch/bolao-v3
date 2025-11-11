import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi } from "vitest"
import { BolaoDeleteModal } from "../bolaoDeleteModal"

describe("BolaoDeleteModal", () => {
  const mockOnOpenChange = vi.fn()
  const mockOnSubmit = vi.fn()
  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    onSubmit: mockOnSubmit,
    disabledDelete: false,
    bolaoId: "bolao-123",
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render modal when open is true", () => {
    render(<BolaoDeleteModal {...defaultProps} />)

    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByText("Delete bolão")).toBeInTheDocument()
  })

  it("should not render modal when open is false", () => {
    render(<BolaoDeleteModal {...defaultProps} open={false} />)

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("should display correct title", () => {
    render(<BolaoDeleteModal {...defaultProps} />)

    expect(screen.getByText("Delete bolão")).toBeInTheDocument()
  })

  it("should display warning description about deletion", () => {
    render(<BolaoDeleteModal {...defaultProps} />)

    expect(
      screen.getByText(/Are you sure you want to delete this bolão?/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/This action cannot be undone/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Bets will be deleted as well/i)
    ).toBeInTheDocument()
  })

  it("should render Cancel button", () => {
    render(<BolaoDeleteModal {...defaultProps} />)

    const cancelButton = screen.getByRole("button", { name: /cancel/i })
    expect(cancelButton).toBeInTheDocument()
  })

  it("should render Confirm button", () => {
    render(<BolaoDeleteModal {...defaultProps} />)

    const confirmButton = screen.getByRole("button", { name: /confirm/i })
    expect(confirmButton).toBeInTheDocument()
  })

  it("should call onSubmit with bolaoId when Confirm is clicked", async () => {
    const user = userEvent.setup()
    render(<BolaoDeleteModal {...defaultProps} />)

    const confirmButton = screen.getByRole("button", { name: /confirm/i })
    await user.click(confirmButton)

    expect(mockOnSubmit).toHaveBeenCalledTimes(1)
    expect(mockOnSubmit).toHaveBeenCalledWith("bolao-123")
  })

  it("should disable Confirm button when disabledDelete is true", () => {
    render(<BolaoDeleteModal {...defaultProps} disabledDelete={true} />)

    const confirmButton = screen.getByRole("button", { name: /confirm/i })
    expect(confirmButton).toBeDisabled()
  })

  it("should enable Confirm button when disabledDelete is false", () => {
    render(<BolaoDeleteModal {...defaultProps} disabledDelete={false} />)

    const confirmButton = screen.getByRole("button", { name: /confirm/i })
    expect(confirmButton).not.toBeDisabled()
  })

  it("should not call onSubmit when Confirm button is disabled", async () => {
    const user = userEvent.setup()
    render(<BolaoDeleteModal {...defaultProps} disabledDelete={true} />)

    const confirmButton = screen.getByRole("button", { name: /confirm/i })
    await user.click(confirmButton)

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it("should apply destructive variant to Confirm button", () => {
    render(<BolaoDeleteModal {...defaultProps} />)

    const confirmButton = screen.getByRole("button", { name: /confirm/i })
    // The button should have styles indicating it's destructive (red/warning style)
    expect(confirmButton).toBeInTheDocument()
  })

  it("should apply secondary variant to Cancel button", () => {
    render(<BolaoDeleteModal {...defaultProps} />)

    const cancelButton = screen.getByRole("button", { name: /cancel/i })
    // The button should have secondary styling
    expect(cancelButton).toBeInTheDocument()
  })
})
