import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { BalancePanel } from "./BalancePanel"
import { useSessionStore } from "@/stores/session.store"
import { createWrapper } from "@/test/utils"

vi.mock("@/hooks/useBalances", () => ({
  useBalances: vi.fn(),
}))

vi.mock("@/hooks/useSetBalance", () => ({
  useSetBalance: vi.fn(),
}))

import { useBalances } from "@/hooks/useBalances"
import { useSetBalance } from "@/hooks/useSetBalance"

const mockUseBalances = vi.mocked(useBalances)
const mockUseSetBalance = vi.mocked(useSetBalance)

const defaultSetBalanceMutate = vi.fn()

describe("BalancePanel", () => {
  beforeEach(() => {
    useSessionStore.setState({ userId: "user1" })
    defaultSetBalanceMutate.mockClear()
    mockUseSetBalance.mockReturnValue({
      mutate: defaultSetBalanceMutate,
      isPending: false,
      error: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
  })

  it("shows set user ID prompt when userId is empty", () => {
    useSessionStore.setState({ userId: "" })
    mockUseBalances.mockReturnValue({ data: undefined } as ReturnType<typeof useBalances>)
    render(<BalancePanel />, { wrapper: createWrapper() })
    expect(screen.getByText("Set a user ID to view balances")).toBeInTheDocument()
  })

  it("shows loading state when data is undefined", () => {
    mockUseBalances.mockReturnValue({ data: undefined } as ReturnType<typeof useBalances>)
    render(<BalancePanel />, { wrapper: createWrapper() })
    expect(screen.getByText("Loading balances…")).toBeInTheDocument()
  })

  it("shows not implemented message", () => {
    mockUseBalances.mockReturnValue({
      data: { notImplemented: true as const, message: "not ready" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    render(<BalancePanel />, { wrapper: createWrapper() })
    expect(screen.getByText(/Engine not ready/)).toBeInTheDocument()
  })

  it("shows no balances found when balances array is empty", () => {
    mockUseBalances.mockReturnValue({
      data: { balances: [] },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    render(<BalancePanel />, { wrapper: createWrapper() })
    expect(screen.getByText("No balances found")).toBeInTheDocument()
  })

  it("renders balances when data is available", () => {
    mockUseBalances.mockReturnValue({
      data: { balances: [{ asset: "BTC", available: "1000000000000000000", reserved: "0" }] },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    render(<BalancePanel />, { wrapper: createWrapper() })
    expect(screen.getByText("BTC")).toBeInTheDocument()
    expect(screen.getByText("1.000000")).toBeInTheDocument()
  })

  it("shows error message when set balance mutation fails", () => {
    mockUseBalances.mockReturnValue({ data: undefined } as ReturnType<typeof useBalances>)
    mockUseSetBalance.mockReturnValue({
      mutate: defaultSetBalanceMutate,
      isPending: false,
      error: new Error("Failed to set balance"),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    render(<BalancePanel />, { wrapper: createWrapper() })
    expect(screen.getByText("Failed to set balance")).toBeInTheDocument()
  })

  it("shows 'Setting…' when isPending is true", () => {
    mockUseBalances.mockReturnValue({ data: undefined } as ReturnType<typeof useBalances>)
    mockUseSetBalance.mockReturnValue({
      mutate: defaultSetBalanceMutate,
      isPending: true,
      error: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    render(<BalancePanel />, { wrapper: createWrapper() })
    expect(screen.getByText("Setting…")).toBeInTheDocument()
  })

  it("shows 'Set' button by default", () => {
    mockUseBalances.mockReturnValue({ data: undefined } as ReturnType<typeof useBalances>)
    render(<BalancePanel />, { wrapper: createWrapper() })
    expect(screen.getByText("Set")).toBeInTheDocument()
  })

  it("calls setBalance mutate with correct data on form submit", async () => {
    mockUseBalances.mockReturnValue({ data: undefined } as ReturnType<typeof useBalances>)
    render(<BalancePanel />, { wrapper: createWrapper() })

    fireEvent.change(screen.getByPlaceholderText("Asset (e.g. BTC)"), { target: { value: "btc" } })
    fireEvent.change(screen.getByPlaceholderText("Available (e.g. 1.5)"), { target: { value: "1.5" } })
    fireEvent.change(screen.getByPlaceholderText("Reserved (default 0)"), { target: { value: "0.1" } })

    fireEvent.click(screen.getByText("Set"))

    expect(defaultSetBalanceMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user1",
        asset: "BTC",
      }),
      expect.any(Object)
    )
  })

  it("does not call setBalance mutate when asset is empty", () => {
    mockUseBalances.mockReturnValue({ data: undefined } as ReturnType<typeof useBalances>)
    render(<BalancePanel />, { wrapper: createWrapper() })

    fireEvent.change(screen.getByPlaceholderText("Available (e.g. 1.5)"), { target: { value: "1.5" } })
    fireEvent.submit(screen.getByPlaceholderText("Available (e.g. 1.5)").closest("form")!)

    expect(defaultSetBalanceMutate).not.toHaveBeenCalled()
  })

  it("does not call setBalance mutate when available is empty", () => {
    mockUseBalances.mockReturnValue({ data: undefined } as ReturnType<typeof useBalances>)
    render(<BalancePanel />, { wrapper: createWrapper() })

    fireEvent.change(screen.getByPlaceholderText("Asset (e.g. BTC)"), { target: { value: "BTC" } })
    fireEvent.submit(screen.getByPlaceholderText("Asset (e.g. BTC)").closest("form")!)

    expect(defaultSetBalanceMutate).not.toHaveBeenCalled()
  })

  it("uses '0' for reserved when reserved field is empty", () => {
    mockUseBalances.mockReturnValue({ data: undefined } as ReturnType<typeof useBalances>)
    render(<BalancePanel />, { wrapper: createWrapper() })

    fireEvent.change(screen.getByPlaceholderText("Asset (e.g. BTC)"), { target: { value: "BTC" } })
    fireEvent.change(screen.getByPlaceholderText("Available (e.g. 1.5)"), { target: { value: "1.0" } })

    fireEvent.click(screen.getByText("Set"))

    expect(defaultSetBalanceMutate).toHaveBeenCalledWith(
      expect.objectContaining({ reserved: "0" }),
      expect.any(Object)
    )
  })

  it("clears form inputs on successful mutation", async () => {
    mockUseBalances.mockReturnValue({ data: undefined } as ReturnType<typeof useBalances>)
    let onSuccessCallback: (() => void) | undefined
    mockUseSetBalance.mockReturnValue({
      mutate: vi.fn((_req, options) => {
        onSuccessCallback = options?.onSuccess
      }),
      isPending: false,
      error: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<BalancePanel />, { wrapper: createWrapper() })

    const assetInput = screen.getByPlaceholderText("Asset (e.g. BTC)") as HTMLInputElement
    const availableInput = screen.getByPlaceholderText("Available (e.g. 1.5)") as HTMLInputElement

    fireEvent.change(assetInput, { target: { value: "BTC" } })
    fireEvent.change(availableInput, { target: { value: "1.5" } })
    fireEvent.click(screen.getByText("Set"))

    onSuccessCallback?.()

    await waitFor(() => {
      expect(assetInput.value).toBe("")
      expect(availableInput.value).toBe("")
    })
  })
})
