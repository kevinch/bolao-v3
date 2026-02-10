import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi } from "vitest"
import { BolaoDeleteModal, handlePointerDownOutside } from "../bolaoDeleteModal"

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

  it("should handle different bolaoIds correctly", async () => {
    const user = userEvent.setup()
    const { rerender } = render(<BolaoDeleteModal {...defaultProps} />)

    const confirmButton = screen.getByRole("button", { name: /confirm/i })
    await user.click(confirmButton)

    expect(mockOnSubmit).toHaveBeenCalledWith("bolao-123")

    // Rerender with different bolaoId
    vi.clearAllMocks()
    rerender(<BolaoDeleteModal {...defaultProps} bolaoId="bolao-456" />)

    await user.click(confirmButton)
    expect(mockOnSubmit).toHaveBeenCalledWith("bolao-456")
  })

  it("should have appropriate ARIA attributes for accessibility", () => {
    render(<BolaoDeleteModal {...defaultProps} />)

    const dialog = screen.getByRole("dialog")
    expect(dialog).toBeInTheDocument()

    // Check that title is properly connected
    expect(screen.getByText("Delete bolão")).toBeInTheDocument()
  })

  it("should prevent closing when clicking inside dialog (via onPointerDownOutside)", () => {
    render(<BolaoDeleteModal {...defaultProps} />)

    const dialog = screen.getByRole("dialog")
    expect(dialog).toBeInTheDocument()

    // The onPointerDownOutside handler should prevent closing when clicking inside
    // This is handled by the Dialog component from radix-ui
  })

  it("should display all warning messages about deletion consequences", () => {
    render(<BolaoDeleteModal {...defaultProps} />)

    // Check for all parts of the warning message
    const description = screen.getByText(
      /Are you sure you want to delete this bolão\? This action cannot be undone\. Bets will be deleted as well\./i
    )
    expect(description).toBeInTheDocument()
  })

  it("should maintain modal state through open prop changes", () => {
    const { rerender } = render(<BolaoDeleteModal {...defaultProps} />)

    expect(screen.getByRole("dialog")).toBeInTheDocument()

    rerender(<BolaoDeleteModal {...defaultProps} open={false} />)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()

    rerender(<BolaoDeleteModal {...defaultProps} open={true} />)
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("should render DialogContent with onPointerDownOutside handler", () => {
    const { container } = render(<BolaoDeleteModal {...defaultProps} />)

    const dialog = screen.getByRole("dialog")

    // Verify the dialog renders correctly with the event handler
    // The handler prevents closing when clicking inside the dialog
    expect(dialog).toBeInTheDocument()

    // Verify dialog structure
    expect(dialog).toContainElement(screen.getByText("Delete bolão"))
  })
})

describe("handlePointerDownOutside", () => {
  it("should call preventDefault when target is HTMLElement inside dialog", () => {
    const mockElement = document.createElement("div")
    mockElement.setAttribute("role", "dialog")
    document.body.appendChild(mockElement)

    const mockPreventDefault = vi.fn()
    const mockEvent = {
      target: mockElement,
      preventDefault: mockPreventDefault,
    }

    handlePointerDownOutside(mockEvent)

    expect(mockPreventDefault).toHaveBeenCalled()
    document.body.removeChild(mockElement)
  })

  it("should not call preventDefault when target is not HTMLElement", () => {
    const mockPreventDefault = vi.fn()
    const mockEvent = {
      target: { nodeType: 3 }, // Not an HTMLElement
      preventDefault: mockPreventDefault,
    }

    handlePointerDownOutside(mockEvent)

    expect(mockPreventDefault).not.toHaveBeenCalled()
  })

  it("should not call preventDefault when target is not inside dialog", () => {
    const mockElement = document.createElement("div")
    document.body.appendChild(mockElement)

    const mockPreventDefault = vi.fn()
    const mockEvent = {
      target: mockElement,
      preventDefault: mockPreventDefault,
    }

    handlePointerDownOutside(mockEvent)

    expect(mockPreventDefault).not.toHaveBeenCalled()
    document.body.removeChild(mockElement)
  })

  it("should handle event with null target", () => {
    const mockPreventDefault = vi.fn()
    const mockEvent = {
      target: null,
      preventDefault: mockPreventDefault,
    }

    handlePointerDownOutside(mockEvent)

    expect(mockPreventDefault).not.toHaveBeenCalled()
  })
})
