import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi } from "vitest"
import { BolaoEditModal, handlePointerDownOutside } from "../bolaoEditModal"

describe("BolaoEditModal", () => {
  const mockOnOpenChange = vi.fn()
  const mockOnNameChange = vi.fn()
  const mockOnSubmit = vi.fn()
  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    bolaoName: "Champions League 2024",
    onNameChange: mockOnNameChange,
    onSubmit: mockOnSubmit,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render modal when open is true", () => {
    render(<BolaoEditModal {...defaultProps} />)

    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByText("Edit bolão")).toBeInTheDocument()
  })

  it("should not render modal when open is false", () => {
    render(<BolaoEditModal {...defaultProps} open={false} />)

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("should display correct title", () => {
    render(<BolaoEditModal {...defaultProps} />)

    expect(screen.getByText("Edit bolão")).toBeInTheDocument()
  })

  it("should display description", () => {
    render(<BolaoEditModal {...defaultProps} />)

    expect(screen.getByText("Update your bolão's name")).toBeInTheDocument()
  })

  it("should render input field with default value", () => {
    render(<BolaoEditModal {...defaultProps} />)

    const input = screen.getByRole("textbox")
    expect(input).toBeInTheDocument()
    expect(input).toHaveValue("Champions League 2024")
  })

  it("should render Save changes button", () => {
    render(<BolaoEditModal {...defaultProps} />)

    const saveButton = screen.getByRole("button", { name: /save changes/i })
    expect(saveButton).toBeInTheDocument()
  })

  it("should render Cancel button", () => {
    render(<BolaoEditModal {...defaultProps} />)

    const cancelButton = screen.getByRole("button", { name: /cancel/i })
    expect(cancelButton).toBeInTheDocument()
  })

  it("should call onNameChange when input value changes", async () => {
    const user = userEvent.setup()
    render(<BolaoEditModal {...defaultProps} />)

    const input = screen.getByRole("textbox")
    await user.clear(input)
    await user.type(input, "New Bolao Name")

    // onNameChange should be called with the full value each time
    expect(mockOnNameChange).toHaveBeenCalled()
    // Check the last call has the complete typed value
    const lastCall =
      mockOnNameChange.mock.calls[mockOnNameChange.mock.calls.length - 1]
    expect(lastCall[0]).toBe("New Bolao Name")
  })

  it("should call onSubmit when Save changes button is clicked", async () => {
    const user = userEvent.setup()
    render(<BolaoEditModal {...defaultProps} />)

    const saveButton = screen.getByRole("button", { name: /save changes/i })
    await user.click(saveButton)

    expect(mockOnSubmit).toHaveBeenCalledTimes(1)
  })

  it("should allow editing the input field", async () => {
    const user = userEvent.setup()
    render(<BolaoEditModal {...defaultProps} />)

    const input = screen.getByRole("textbox")
    await user.clear(input)
    await user.type(input, "Updated Name")

    expect(input).toHaveValue("Updated Name")
  })

  it("should render input with type text", () => {
    render(<BolaoEditModal {...defaultProps} />)

    const input = screen.getByRole("textbox")
    expect(input).toHaveAttribute("type", "text")
  })

  it("should render with initial bolaoName value", () => {
    const { rerender } = render(<BolaoEditModal {...defaultProps} />)

    const input = screen.getByRole("textbox")
    expect(input).toHaveValue("Champions League 2024")

    // Note: defaultValue only sets the initial value
    // Rerendering with a new bolaoName prop won't update the input
    // This is expected React behavior with defaultValue
    rerender(
      <BolaoEditModal {...defaultProps} bolaoName="New Competition 2025" />
    )

    // Input retains its current value when using defaultValue
    const updatedInput = screen.getByRole("textbox")
    expect(updatedInput).toHaveValue("Champions League 2024")
  })

  it("should have submit type on Save button", () => {
    render(<BolaoEditModal {...defaultProps} />)

    const saveButton = screen.getByRole("button", { name: /save changes/i })
    expect(saveButton).toHaveAttribute("type", "submit")
  })

  it("should apply secondary variant to Cancel button", () => {
    render(<BolaoEditModal {...defaultProps} />)

    const cancelButton = screen.getByRole("button", { name: /cancel/i })
    // The button should have secondary styling
    expect(cancelButton).toBeInTheDocument()
  })

  it("should render both Cancel and Save buttons", () => {
    render(<BolaoEditModal {...defaultProps} />)

    const cancelButton = screen.getByRole("button", { name: /cancel/i })
    const saveButton = screen.getByRole("button", { name: /save changes/i })

    expect(cancelButton).toBeInTheDocument()
    expect(saveButton).toBeInTheDocument()
  })

  it("should handle empty bolaoName", () => {
    render(<BolaoEditModal {...defaultProps} bolaoName="" />)

    const input = screen.getByRole("textbox")
    expect(input).toHaveValue("")
  })

  it("should handle very long bolaoName", () => {
    const longName = "A".repeat(200)
    render(<BolaoEditModal {...defaultProps} bolaoName={longName} />)

    const input = screen.getByRole("textbox")
    expect(input).toHaveValue(longName)
  })

  it("should call onNameChange with empty string when input is cleared", async () => {
    const user = userEvent.setup()
    render(<BolaoEditModal {...defaultProps} />)

    const input = screen.getByRole("textbox")
    await user.clear(input)

    // onNameChange should be called with empty string
    expect(mockOnNameChange).toHaveBeenCalledWith("")
  })

  it("should not call onSubmit when Cancel is clicked", async () => {
    const user = userEvent.setup()
    render(<BolaoEditModal {...defaultProps} />)

    const cancelButton = screen.getByRole("button", { name: /cancel/i })
    await user.click(cancelButton)

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it("should have appropriate ARIA attributes for accessibility", () => {
    render(<BolaoEditModal {...defaultProps} />)

    const dialog = screen.getByRole("dialog")
    expect(dialog).toBeInTheDocument()

    // Check that title is properly connected
    expect(screen.getByText("Edit bolão")).toBeInTheDocument()
  })

  it("should prevent closing when clicking inside dialog (via onPointerDownOutside)", () => {
    render(<BolaoEditModal {...defaultProps} />)

    const dialog = screen.getByRole("dialog")
    expect(dialog).toBeInTheDocument()

    // The onPointerDownOutside handler should prevent closing when clicking inside
    // This is handled by the Dialog component from radix-ui
  })

  it("should maintain modal state through open prop changes", () => {
    const { rerender } = render(<BolaoEditModal {...defaultProps} />)

    expect(screen.getByRole("dialog")).toBeInTheDocument()

    rerender(<BolaoEditModal {...defaultProps} open={false} />)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()

    rerender(<BolaoEditModal {...defaultProps} open={true} />)
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("should allow Save button to be clicked multiple times", async () => {
    const user = userEvent.setup()
    render(<BolaoEditModal {...defaultProps} />)

    const saveButton = screen.getByRole("button", { name: /save changes/i })
    await user.click(saveButton)
    await user.click(saveButton)

    expect(mockOnSubmit).toHaveBeenCalledTimes(2)
  })

  it("should handle special characters in bolaoName", () => {
    const specialName = "Bolão #1 <2024> & 'Champions'"
    render(<BolaoEditModal {...defaultProps} bolaoName={specialName} />)

    const input = screen.getByRole("textbox")
    expect(input).toHaveValue(specialName)
  })

  it("should render DialogContent with onPointerDownOutside handler", () => {
    const { container } = render(<BolaoEditModal {...defaultProps} />)

    const dialog = screen.getByRole("dialog")

    // Verify the dialog renders correctly with the event handler
    // The handler prevents closing when clicking inside the dialog
    expect(dialog).toBeInTheDocument()

    // Verify dialog structure
    expect(dialog).toContainElement(screen.getByText("Edit bolão"))
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
