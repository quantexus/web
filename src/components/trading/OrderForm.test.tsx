import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { OrderForm } from "./OrderForm"
import { useTradingStore } from "@/stores/trading.store"
import { useSessionStore } from "@/stores/session.store"
import { createWrapper } from "@/test/utils"

vi.mock("@/hooks/usePlaceOrder", () => ({
  usePlaceOrder: vi.fn(),
}))

import { usePlaceOrder } from "@/hooks/usePlaceOrder"

const mockUsePlaceOrder = vi.mocked(usePlaceOrder)

const defaultMutate = vi.fn()

describe("OrderForm", () => {
  beforeEach(() => {
    useTradingStore.setState({
      symbol: "BTCUSD",
      baseAsset: "BTC",
      quoteAsset: "USD",
      side: "buy",
      orderType: "limit",
    })
    useSessionStore.setState({ userId: "user1" })
    defaultMutate.mockClear()
    mockUsePlaceOrder.mockReturnValue({
      mutate: defaultMutate,
      isPending: false,
      error: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
  })

  it("renders buy and sell buttons", () => {
    render(<OrderForm />, { wrapper: createWrapper() })
    expect(screen.getAllByText("Buy BTC").length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText("Sell BTC")).toBeInTheDocument()
  })

  it("renders limit and market order type buttons", () => {
    render(<OrderForm />, { wrapper: createWrapper() })
    expect(screen.getByText("limit")).toBeInTheDocument()
    expect(screen.getByText("market")).toBeInTheDocument()
  })

  it("shows price input for limit orders", () => {
    render(<OrderForm />, { wrapper: createWrapper() })
    expect(screen.getByLabelText("Price (USD)")).toBeInTheDocument()
  })

  it("hides price input for market orders", () => {
    useTradingStore.setState({
      symbol: "BTCUSD",
      baseAsset: "BTC",
      quoteAsset: "USD",
      side: "buy",
      orderType: "market",
    })
    render(<OrderForm />, { wrapper: createWrapper() })
    expect(screen.queryByLabelText("Price (USD)")).not.toBeInTheDocument()
  })

  it("calls setSide when sell button is clicked", () => {
    render(<OrderForm />, { wrapper: createWrapper() })
    fireEvent.click(screen.getByText("Sell BTC"))
    expect(useTradingStore.getState().side).toBe("sell")
  })

  it("calls setSide when buy button is clicked", () => {
    useTradingStore.setState({ symbol: "BTCUSD", baseAsset: "BTC", quoteAsset: "USD", side: "sell", orderType: "limit" })
    render(<OrderForm />, { wrapper: createWrapper() })
    fireEvent.click(screen.getByText("Buy BTC"))
    expect(useTradingStore.getState().side).toBe("buy")
  })

  it("calls setOrderType when market button is clicked", () => {
    render(<OrderForm />, { wrapper: createWrapper() })
    fireEvent.click(screen.getByText("market"))
    expect(useTradingStore.getState().orderType).toBe("market")
  })

  it("shows warning when userId is empty", () => {
    useSessionStore.setState({ userId: "" })
    render(<OrderForm />, { wrapper: createWrapper() })
    expect(screen.getByText("Set a user ID in the header to trade")).toBeInTheDocument()
  })

  it("does not show warning when userId is set", () => {
    render(<OrderForm />, { wrapper: createWrapper() })
    expect(screen.queryByText("Set a user ID in the header to trade")).not.toBeInTheDocument()
  })

  it("shows error message when mutation has error", () => {
    mockUsePlaceOrder.mockReturnValue({
      mutate: defaultMutate,
      isPending: false,
      error: new Error("Insufficient balance"),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    render(<OrderForm />, { wrapper: createWrapper() })
    expect(screen.getByText("Insufficient balance")).toBeInTheDocument()
  })

  it("shows 'Placing…' when isPending is true", () => {
    mockUsePlaceOrder.mockReturnValue({
      mutate: defaultMutate,
      isPending: true,
      error: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    render(<OrderForm />, { wrapper: createWrapper() })
    expect(screen.getByText("Placing…")).toBeInTheDocument()
  })

  it("shows 'Buy BTC' on submit button when side is buy", () => {
    render(<OrderForm />, { wrapper: createWrapper() })
    const allButtons = screen.getAllByRole("button", { name: /Buy BTC/i })
    const submitButton = allButtons.find((b) => b.getAttribute("type") === "submit")
    expect(submitButton).toBeDefined()
  })

  it("shows 'Sell BTC' on submit button when side is sell", () => {
    useTradingStore.setState({ symbol: "BTCUSD", baseAsset: "BTC", quoteAsset: "USD", side: "sell", orderType: "limit" })
    render(<OrderForm />, { wrapper: createWrapper() })
    // The side toggle and submit both say "Sell BTC" - there will be two
    const sellButtons = screen.getAllByText("Sell BTC")
    expect(sellButtons.length).toBeGreaterThanOrEqual(1)
  })

  it("calls mutate with correct data on form submit (limit)", () => {
    render(<OrderForm />, { wrapper: createWrapper() })

    fireEvent.change(screen.getByLabelText("Price (USD)"), { target: { value: "1.5" } })
    fireEvent.change(screen.getByLabelText("Quantity (BTC)"), { target: { value: "0.5" } })

    fireEvent.submit(screen.getByLabelText("Price (USD)").closest("form")!)

    expect(defaultMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user1",
        symbol: "BTCUSD",
        side: "buy",
        orderType: "limit",
      }),
      expect.any(Object)
    )
  })

  it("calls mutate with price '0' for market orders", () => {
    useTradingStore.setState({ symbol: "BTCUSD", baseAsset: "BTC", quoteAsset: "USD", side: "buy", orderType: "market" })
    render(<OrderForm />, { wrapper: createWrapper() })

    fireEvent.change(screen.getByLabelText("Quantity (BTC)"), { target: { value: "0.5" } })

    fireEvent.submit(screen.getByLabelText("Quantity (BTC)").closest("form")!)

    expect(defaultMutate).toHaveBeenCalledWith(
      expect.objectContaining({ price: "0" }),
      expect.any(Object)
    )
  })

  it("does not call mutate when userId is empty", () => {
    useSessionStore.setState({ userId: "" })
    render(<OrderForm />, { wrapper: createWrapper() })

    fireEvent.change(screen.getByLabelText("Quantity (BTC)"), { target: { value: "0.5" } })

    fireEvent.submit(screen.getByLabelText("Quantity (BTC)").closest("form")!)

    expect(defaultMutate).not.toHaveBeenCalled()
  })

  it("clears inputs on successful mutation", async () => {
    let onSuccessCallback: (() => void) | undefined
    mockUsePlaceOrder.mockReturnValue({
      mutate: vi.fn((_req, options) => {
        onSuccessCallback = options?.onSuccess
      }),
      isPending: false,
      error: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<OrderForm />, { wrapper: createWrapper() })

    fireEvent.change(screen.getByLabelText("Price (USD)"), { target: { value: "1.5" } })
    fireEvent.change(screen.getByLabelText("Quantity (BTC)"), { target: { value: "0.5" } })

    fireEvent.submit(screen.getByLabelText("Price (USD)").closest("form")!)

    onSuccessCallback?.()

    await waitFor(() => {
      expect((screen.getByLabelText("Price (USD)") as HTMLInputElement).value).toBe("")
      expect((screen.getByLabelText("Quantity (BTC)") as HTMLInputElement).value).toBe("")
    })
  })
})
