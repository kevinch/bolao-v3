import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import ButtonsBet from "../buttonsBet"
import * as actions from "@/app/lib/actions"

// Mock the actions
vi.mock("@/app/lib/actions", () => ({
  createBet: vi.fn(),
  updateBet: vi.fn(),
}))

describe("ButtonsBet", () => {
  const defaultProps = {
    userBolaoId: "user-bolao-123",
    type: "home" as const,
    fixtureId: "fixture-456",
    disabled: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("Component Rendering", () => {
    it("should render with initial bet value (dot)", () => {
      render(<ButtonsBet {...defaultProps} />)

      expect(screen.getByText(".")).toBeInTheDocument()
      expect(screen.getAllByRole("button")).toHaveLength(2)
    })

    it("should render with provided bet value", () => {
      render(<ButtonsBet {...defaultProps} betValue={3} />)

      expect(screen.getByText("3")).toBeInTheDocument()
    })

    it("should render increment and decrement buttons", () => {
      render(<ButtonsBet {...defaultProps} />)

      const buttons = screen.getAllByRole("button")
      expect(buttons).toHaveLength(2)
    })

    it("should display current value between buttons", () => {
      render(<ButtonsBet {...defaultProps} betValue={5} />)

      const valueDisplay = screen.getByText("5")
      expect(valueDisplay).toBeInTheDocument()
      expect(valueDisplay.parentElement).toHaveClass("flex", "items-center")
    })
  })

  describe("Button Interactions", () => {
    it("should increment value when plus button is clicked", async () => {
      const user = userEvent.setup()
      render(<ButtonsBet {...defaultProps} betValue={2} />)

      const buttons = screen.getAllByRole("button")
      const incrementButton = buttons[1] // Plus button is second

      await user.click(incrementButton)

      expect(screen.getByText("3")).toBeInTheDocument()
    })

    it("should decrement value when minus button is clicked", async () => {
      const user = userEvent.setup()
      render(<ButtonsBet {...defaultProps} betValue={3} />)

      const buttons = screen.getAllByRole("button")
      const decrementButton = buttons[0] // Minus button is first

      await user.click(decrementButton)

      expect(screen.getByText("2")).toBeInTheDocument()
    })

    it("should increment from initial value (dot) to 0", async () => {
      const user = userEvent.setup()
      render(<ButtonsBet {...defaultProps} />)

      expect(screen.getByText(".")).toBeInTheDocument()

      const buttons = screen.getAllByRole("button")
      const incrementButton = buttons[1]

      await user.click(incrementButton)

      expect(screen.getByText("0")).toBeInTheDocument()
      expect(screen.queryByText(".")).not.toBeInTheDocument()
    })

    it("should not decrement below 0", async () => {
      const user = userEvent.setup()
      render(<ButtonsBet {...defaultProps} betValue={0} />)

      const buttons = screen.getAllByRole("button")
      const decrementButton = buttons[0]

      await user.click(decrementButton)

      expect(screen.getByText("0")).toBeInTheDocument()
    })

    it("should not decrement from initial value (dot)", async () => {
      const user = userEvent.setup()
      render(<ButtonsBet {...defaultProps} />)

      expect(screen.getByText(".")).toBeInTheDocument()

      const buttons = screen.getAllByRole("button")
      const decrementButton = buttons[0]

      await user.click(decrementButton)

      expect(screen.getByText(".")).toBeInTheDocument()
    })

    it("should handle multiple increments", async () => {
      const user = userEvent.setup()
      render(<ButtonsBet {...defaultProps} betValue={0} />)

      const buttons = screen.getAllByRole("button")
      const incrementButton = buttons[1]

      await user.click(incrementButton)
      expect(screen.getByText("1")).toBeInTheDocument()

      await user.click(incrementButton)
      expect(screen.getByText("2")).toBeInTheDocument()

      await user.click(incrementButton)
      expect(screen.getByText("3")).toBeInTheDocument()
    })

    it("should handle multiple decrements", async () => {
      const user = userEvent.setup()
      render(<ButtonsBet {...defaultProps} betValue={5} />)

      const buttons = screen.getAllByRole("button")
      const decrementButton = buttons[0]

      await user.click(decrementButton)
      expect(screen.getByText("4")).toBeInTheDocument()

      await user.click(decrementButton)
      expect(screen.getByText("3")).toBeInTheDocument()

      await user.click(decrementButton)
      expect(screen.getByText("2")).toBeInTheDocument()
    })
  })

  describe("Disabled State", () => {
    it("should disable buttons when disabled prop is true", () => {
      render(<ButtonsBet {...defaultProps} disabled={true} />)

      const buttons = screen.getAllByRole("button")
      buttons.forEach((button) => {
        expect(button).toBeDisabled()
      })
    })

    it("should not allow interactions when disabled", async () => {
      const user = userEvent.setup()
      render(<ButtonsBet {...defaultProps} betValue={3} disabled={true} />)

      const buttons = screen.getAllByRole("button")
      const incrementButton = buttons[1]

      await user.click(incrementButton)

      // Value should remain unchanged
      expect(screen.getByText("3")).toBeInTheDocument()
    })

    it("should change button variant when disabled", () => {
      const { container } = render(
        <ButtonsBet {...defaultProps} disabled={true} />
      )

      const buttons = container.querySelectorAll("button")
      buttons.forEach((button) => {
        expect(button).toBeDisabled()
      })
    })
  })

  describe("Bet Creation (No Existing Bet)", () => {
    it("should create new bet when value changes from initial", async () => {
      const user = userEvent.setup()
      const mockCreateBet = vi.mocked(actions.createBet)
      mockCreateBet.mockResolvedValue({
        id: "new-bet-123",
        user_bolao_id: "user-bolao-123",
        fixture_id: "fixture-456",
        value: 0,
        type: "home",
      })

      render(<ButtonsBet {...defaultProps} />)

      const buttons = screen.getAllByRole("button")
      const incrementButton = buttons[1]

      await user.click(incrementButton)
      expect(screen.getByText("0")).toBeInTheDocument()

      // Wait for debounce (300ms)
      await waitFor(
        () => {
          expect(mockCreateBet).toHaveBeenCalledWith({
            userBolaoId: "user-bolao-123",
            value: 0,
            type: "home",
            fixtureId: "fixture-456",
          })
        },
        { timeout: 1000 }
      )
    })

    it("should create bet with correct type (away)", async () => {
      const user = userEvent.setup()
      const mockCreateBet = vi.mocked(actions.createBet)
      mockCreateBet.mockResolvedValue({
        id: "new-bet-123",
        user_bolao_id: "user-bolao-123",
        fixture_id: "fixture-456",
        value: 2,
        type: "away",
      })

      render(<ButtonsBet {...defaultProps} type="away" />)

      const buttons = screen.getAllByRole("button")
      const incrementButton = buttons[1]

      await user.click(incrementButton)
      await user.click(incrementButton)
      await user.click(incrementButton)

      // Wait for debounce (300ms)
      await waitFor(
        () => {
          expect(mockCreateBet).toHaveBeenCalledWith({
            userBolaoId: "user-bolao-123",
            value: 2,
            type: "away",
            fixtureId: "fixture-456",
          })
        },
        { timeout: 1000 }
      )
    })

    it("should not create bet if value is still initial (dot)", async () => {
      const mockCreateBet = vi.mocked(actions.createBet)

      render(<ButtonsBet {...defaultProps} />)

      // Just wait a bit
      await new Promise((resolve) => setTimeout(resolve, 400))

      expect(mockCreateBet).not.toHaveBeenCalled()
    })
  })

  describe("Bet Updates (Existing Bet)", () => {
    it("should update existing bet when value changes", async () => {
      const user = userEvent.setup()
      const mockUpdateBet = vi.mocked(actions.updateBet)
      mockUpdateBet.mockResolvedValue({
        id: "bet-123",
        user_bolao_id: "user-bolao-123",
        fixture_id: "fixture-456",
        value: 4,
        type: "home",
      })

      render(<ButtonsBet {...defaultProps} betValue={3} betId="bet-123" />)

      const buttons = screen.getAllByRole("button")
      const incrementButton = buttons[1]

      await user.click(incrementButton)
      expect(screen.getByText("4")).toBeInTheDocument()

      // Wait for debounce (300ms)
      await waitFor(
        () => {
          expect(mockUpdateBet).toHaveBeenCalledWith({
            betId: "bet-123",
            value: 4,
          })
        },
        { timeout: 1000 }
      )
    })

    it("should update bet after decrement", async () => {
      const user = userEvent.setup()
      const mockUpdateBet = vi.mocked(actions.updateBet)
      mockUpdateBet.mockResolvedValue({
        id: "bet-123",
        user_bolao_id: "user-bolao-123",
        fixture_id: "fixture-456",
        value: 2,
        type: "home",
      })

      render(<ButtonsBet {...defaultProps} betValue={3} betId="bet-123" />)

      const buttons = screen.getAllByRole("button")
      const decrementButton = buttons[0]

      await user.click(decrementButton)

      // Wait for debounce (300ms)
      await waitFor(
        () => {
          expect(mockUpdateBet).toHaveBeenCalledWith({
            betId: "bet-123",
            value: 2,
          })
        },
        { timeout: 1000 }
      )
    })
  })

  describe("Debouncing", () => {
    it("should debounce API calls (300ms)", async () => {
      const user = userEvent.setup()
      const mockCreateBet = vi.mocked(actions.createBet)
      mockCreateBet.mockResolvedValue({
        id: "new-bet-123",
        user_bolao_id: "user-bolao-123",
        fixture_id: "fixture-456",
        value: 1,
        type: "home",
      })

      render(<ButtonsBet {...defaultProps} />)

      const buttons = screen.getAllByRole("button")
      const incrementButton = buttons[1]

      // Click multiple times rapidly
      await user.click(incrementButton)
      await user.click(incrementButton)
      await user.click(incrementButton)

      // Wait for debounce - should only call once with final value
      await waitFor(
        () => {
          expect(mockCreateBet).toHaveBeenCalledTimes(1)
          expect(mockCreateBet).toHaveBeenCalledWith({
            userBolaoId: "user-bolao-123",
            value: 2,
            type: "home",
            fixtureId: "fixture-456",
          })
        },
        { timeout: 1000 }
      )
    })

    it("should reset debounce timer on each value change", async () => {
      const user = userEvent.setup()
      const mockCreateBet = vi.mocked(actions.createBet)
      mockCreateBet.mockResolvedValue({
        id: "new-bet-123",
        user_bolao_id: "user-bolao-123",
        fixture_id: "fixture-456",
        value: 1,
        type: "home",
      })

      render(<ButtonsBet {...defaultProps} />)

      const buttons = screen.getAllByRole("button")
      const incrementButton = buttons[1]

      await user.click(incrementButton)
      // Wait a bit but not the full debounce
      await new Promise((resolve) => setTimeout(resolve, 200))

      await user.click(incrementButton)

      // Wait for the debounce to complete
      await waitFor(
        () => {
          expect(mockCreateBet).toHaveBeenCalledTimes(1)
        },
        { timeout: 1000 }
      )
    })
  })

  describe("Error Handling", () => {
    it("should handle createBet error gracefully", async () => {
      const user = userEvent.setup()
      const mockCreateBet = vi.mocked(actions.createBet)
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {})

      mockCreateBet.mockRejectedValue(new Error("Network error"))

      render(<ButtonsBet {...defaultProps} />)

      const buttons = screen.getAllByRole("button")
      const incrementButton = buttons[1]

      await user.click(incrementButton)

      // Wait for debounce
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error creating/updating bet:",
          expect.any(Error)
        )
      })

      // Component should still be functional
      expect(screen.getByText("0")).toBeInTheDocument()

      consoleErrorSpy.mockRestore()
    })

    it("should handle updateBet error gracefully", async () => {
      const user = userEvent.setup()
      const mockUpdateBet = vi.mocked(actions.updateBet)
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {})

      mockUpdateBet.mockRejectedValue(new Error("Update failed"))

      render(<ButtonsBet {...defaultProps} betValue={3} betId="bet-123" />)

      const buttons = screen.getAllByRole("button")
      const incrementButton = buttons[1]

      await user.click(incrementButton)

      // Wait for debounce
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled()
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe("Edge Cases", () => {
    it("should handle betValue of 0", () => {
      render(<ButtonsBet {...defaultProps} betValue={0} />)

      expect(screen.getByText("0")).toBeInTheDocument()
    })

    it("should handle large bet values", async () => {
      const user = userEvent.setup()
      render(<ButtonsBet {...defaultProps} betValue={99} />)

      expect(screen.getByText("99")).toBeInTheDocument()

      const buttons = screen.getAllByRole("button")
      const incrementButton = buttons[1]

      await user.click(incrementButton)

      expect(screen.getByText("100")).toBeInTheDocument()
    })

    it("should handle rapid increment/decrement combinations", async () => {
      const user = userEvent.setup()
      render(<ButtonsBet {...defaultProps} betValue={5} />)

      const buttons = screen.getAllByRole("button")
      const incrementButton = buttons[1]
      const decrementButton = buttons[0]

      await user.click(incrementButton)
      await user.click(incrementButton)
      await user.click(decrementButton)
      await user.click(incrementButton)

      expect(screen.getByText("7")).toBeInTheDocument()
    })

    it("should persist betId after creation", async () => {
      const user = userEvent.setup()
      const mockCreateBet = vi.mocked(actions.createBet)
      const mockUpdateBet = vi.mocked(actions.updateBet)

      mockCreateBet.mockResolvedValue({
        id: "new-bet-123",
        user_bolao_id: "user-bolao-123",
        fixture_id: "fixture-456",
        value: 0,
        type: "home",
      })

      mockUpdateBet.mockResolvedValue({
        id: "new-bet-123",
        user_bolao_id: "user-bolao-123",
        fixture_id: "fixture-456",
        value: 1,
        type: "home",
      })

      render(<ButtonsBet {...defaultProps} />)

      const buttons = screen.getAllByRole("button")
      const incrementButton = buttons[1]

      // First increment - should create bet
      await user.click(incrementButton)

      await waitFor(() => {
        expect(mockCreateBet).toHaveBeenCalledTimes(1)
      })

      // Second increment - should update bet
      await user.click(incrementButton)

      await waitFor(() => {
        expect(mockUpdateBet).toHaveBeenCalledWith({
          betId: "new-bet-123",
          value: 1,
        })
      })
    })

    it("should use current betIdValue during debounce (no stale closure)", async () => {
      const user = userEvent.setup()
      const mockCreateBet = vi.mocked(actions.createBet)
      const mockUpdateBet = vi.mocked(actions.updateBet)

      // Simulate slow createBet response
      mockCreateBet.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  id: "new-bet-456",
                  user_bolao_id: "user-bolao-123",
                  fixture_id: "fixture-456",
                  value: 1,
                  type: "home",
                }),
              100
            )
          )
      )

      mockUpdateBet.mockResolvedValue({
        id: "new-bet-456",
        user_bolao_id: "user-bolao-123",
        fixture_id: "fixture-456",
        value: 2,
        type: "home",
      })

      render(<ButtonsBet {...defaultProps} />)

      const buttons = screen.getAllByRole("button")
      const incrementButton = buttons[1]

      // Click to 1, then quickly to 2 before debounce completes
      await user.click(incrementButton)
      await user.click(incrementButton)

      // Wait for createBet (first value)
      await waitFor(
        () => {
          expect(mockCreateBet).toHaveBeenCalledTimes(1)
        },
        { timeout: 2000 }
      )

      // Wait for updateBet with the correct betId (regression test for stale closure)
      await waitFor(
        () => {
          expect(mockUpdateBet).toHaveBeenCalledWith({
            betId: "new-bet-456",
            value: 1,
          })
        },
        { timeout: 2000 }
      )

      // Should NOT have called createBet a second time
      expect(mockCreateBet).toHaveBeenCalledTimes(1)
    })
  })
})
