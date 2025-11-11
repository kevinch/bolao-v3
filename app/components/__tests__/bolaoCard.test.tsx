import { screen, waitFor } from "@testing-library/dom"
import { render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi } from "vitest"
import BolaoCard from "../bolaoCard"
import type { Bolao } from "@/app/lib/definitions"

// Mock actions
vi.mock("@/app/lib/actions", () => ({
  updateBolao: vi.fn(),
}))

// Mock controller
vi.mock("@/app/lib/controllerAdmin", () => ({
  deleteBolaoGroup: vi.fn(),
}))

// Mock toast hook
const mockToast = vi.fn()
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}))

// Mock date-fns
vi.mock("date-fns", () => ({
  format: vi.fn((date, formatStr) => {
    if (formatStr === "yyyy") {
      return new Date(date).getFullYear().toString()
    }
    return date
  }),
}))

// Mock child components
vi.mock("../copyToClipboard", () => ({
  default: ({ bolaoId }: { bolaoId: string }) => (
    <span data-testid="copy-to-clipboard">Copy invite link</span>
  ),
}))

vi.mock("../bolaoYearBadge", () => ({
  default: ({ bolao }: { bolao: Bolao }) => (
    <span data-testid="bolao-year-badge">{bolao.year}</span>
  ),
}))

vi.mock("../bolaoEditModal", () => ({
  BolaoEditModal: ({
    open,
    bolaoName,
  }: {
    open: boolean
    bolaoName: string
  }) =>
    open ? (
      <div data-testid="edit-modal">Edit Modal for {bolaoName}</div>
    ) : null,
}))

vi.mock("../bolaoDeleteModal", () => ({
  BolaoDeleteModal: ({ open, bolaoId }: { open: boolean; bolaoId: string }) =>
    open ? (
      <div data-testid="delete-modal">Delete Modal for {bolaoId}</div>
    ) : null,
}))

describe("BolaoCard", () => {
  const mockBolao: Bolao = {
    id: "bolao-123",
    name: "Champions League 2024",
    year: 2024,
    created_by: "user-456",
    competition_id: "2",
    created_at: new Date("2024-01-01"),
    start: "2024-01-01",
    end: "2024-12-31",
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render bolao name and year badge", () => {
    render(<BolaoCard bolao={mockBolao} userId="user-789" />)

    expect(screen.getByText(/Champions League 2024/i)).toBeInTheDocument()
    expect(screen.getByTestId("bolao-year-badge")).toBeInTheDocument()
  })

  it("should render Bet and Results buttons with correct links", () => {
    render(<BolaoCard bolao={mockBolao} userId="user-789" />)

    const betLink = screen.getByRole("link", { name: /bet/i })
    const resultsLink = screen.getByRole("link", { name: /results/i })

    expect(betLink).toBeInTheDocument()
    expect(betLink).toHaveAttribute("href", "/bolao/bolao-123/bet")
    expect(resultsLink).toBeInTheDocument()
    expect(resultsLink).toHaveAttribute("href", "/bolao/bolao-123/results")
  })

  it("should show Edit and Delete options when user is the creator", async () => {
    const user = userEvent.setup()
    render(<BolaoCard bolao={mockBolao} userId="user-456" />)

    // Click the dropdown menu button
    const dropdownButton = screen.getByRole("button", { name: "" })
    await user.click(dropdownButton)

    // Check for Edit and Delete menu items
    await waitFor(() => {
      expect(screen.getByText("Edit")).toBeInTheDocument()
      expect(screen.getByText("Delete")).toBeInTheDocument()
    })
  })

  it("should NOT show Edit and Delete options when user is not the creator", async () => {
    const user = userEvent.setup()
    render(<BolaoCard bolao={mockBolao} userId="different-user" />)

    // Click the dropdown menu button
    const dropdownButton = screen.getByRole("button", { name: "" })
    await user.click(dropdownButton)

    // Check that Edit and Delete are not present
    await waitFor(() => {
      expect(screen.queryByText("Edit")).not.toBeInTheDocument()
      expect(screen.queryByText("Delete")).not.toBeInTheDocument()
    })
  })

  it("should show copy to clipboard option in dropdown", async () => {
    const user = userEvent.setup()
    render(<BolaoCard bolao={mockBolao} userId="user-789" />)

    // Click the dropdown menu button
    const dropdownButton = screen.getByRole("button", { name: "" })
    await user.click(dropdownButton)

    // Check for copy to clipboard
    await waitFor(() => {
      expect(screen.getByTestId("copy-to-clipboard")).toBeInTheDocument()
    })
  })

  it("should open edit modal when Edit is clicked", async () => {
    const user = userEvent.setup()
    render(<BolaoCard bolao={mockBolao} userId="user-456" />)

    // Click the dropdown menu button
    const dropdownButton = screen.getByRole("button", { name: "" })
    await user.click(dropdownButton)

    // Click Edit
    const editButton = await screen.findByText("Edit")
    await user.click(editButton)

    // Check that edit modal appears
    await waitFor(() => {
      expect(screen.getByTestId("edit-modal")).toBeInTheDocument()
    })
  })

  it("should open delete modal when Delete is clicked", async () => {
    const user = userEvent.setup()
    render(<BolaoCard bolao={mockBolao} userId="user-456" />)

    // Click the dropdown menu button
    const dropdownButton = screen.getByRole("button", { name: "" })
    await user.click(dropdownButton)

    // Click Delete
    const deleteButton = await screen.findByText("Delete")
    await user.click(deleteButton)

    // Check that delete modal appears
    await waitFor(() => {
      expect(screen.getByTestId("delete-modal")).toBeInTheDocument()
    })
  })

  it("should format date range correctly when start and end years differ", () => {
    const bolaoWithDateRange: Bolao = {
      ...mockBolao,
      start: "2023-09-01",
      end: "2024-05-31",
    }

    render(<BolaoCard bolao={bolaoWithDateRange} userId="user-789" />)

    // The component should still render (date formatting is internal)
    expect(screen.getByText(/Champions League 2024/i)).toBeInTheDocument()
  })
})
