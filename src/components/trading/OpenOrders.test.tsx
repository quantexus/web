import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { OpenOrders } from "./OpenOrders"
import { useSessionStore } from "@/stores/session.store"
import { useTradingStore } from "@/stores/trading.store"
import { createWrapper } from "@/test/utils"

vi.mock("@/hooks/useOpenOrders", () => ({
  useOpenOrders: vi.fn(),
}))

vi.mock("@/hooks/useCancelOrder", () => ({
  useCancelOrder: vi.fn(),
}))

import { useOpenOrders } from "@/hooks/useOpenOrders"
import { useCancelOrder } from "@/hooks/useCancelOrder"

const mockUseOpenOrders = vi.mocked(useOpenOrders)
const mockUseCancelOrder = vi.mocked(useCancelOrder)

const defaultCancelMutate = vi.fn()

describe("OpenOrders", () => {
  beforeEach(() => {
    useSessionStore.setState({ userId: "user1" })
    useTradingStore.setState({ symbol: "BTCUSD", baseAsset: "BTC", quoteAsset: "USD", side: "buy", orderType: "limit" })
    mockUseCancelOrder.mockReturnValue({
      mutate: defaultCancelMutate,
      isPending: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
  })

  it("shows set user ID prompt when userId is empty", () => {
    useSessionStore.setState({ userId: "" })
    mockUseOpenOrders.mockReturnValue({ data: undefined } as ReturnType<typeof useOpenOrders>)
    render(<OpenOrders />, { wrapper: createWrapper() })
    expect(screen.getByText("Set a user ID to view orders")).toBeInTheDocument()
  })

  it("shows loading state when data is undefined", () => {
    mockUseOpenOrders.mockReturnValue({ data: undefined } as ReturnType<typeof useOpenOrders>)
    render(<OpenOrders />, { wrapper: createWrapper() })
    expect(screen.getByText("Loading orders…")).toBeInTheDocument()
  })

  it("shows not implemented message when notImplemented is true", () => {
    mockUseOpenOrders.mockReturnValue({
      data: { notImplemented: true as const, message: "not ready" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    render(<OpenOrders />, { wrapper: createWrapper() })
    expect(screen.getByText(/Engine not ready/)).toBeInTheDocument()
  })

  it("shows no open orders message when orders array is empty", () => {
    mockUseOpenOrders.mockReturnValue({
      data: { orders: [] },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    render(<OpenOrders />, { wrapper: createWrapper() })
    expect(screen.getByText("No open orders")).toBeInTheDocument()
  })

  it("renders orders in a table", () => {
    const orders = [
      {
        orderId: "o1",
        symbol: "BTCUSD",
        side: "buy",
        price: "1000000000000000000",
        originalQuantity: "500000000000000000",
        filledQuantity: "0",
        status: "PendingMatch",
        createdAt: "2024-01-01",
      },
    ]
    mockUseOpenOrders.mockReturnValue({
      data: { orders },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    render(<OpenOrders />, { wrapper: createWrapper() })
    expect(screen.getByText("buy")).toBeInTheDocument()
    expect(screen.getByText("1.000000")).toBeInTheDocument()
    expect(screen.getByText("PendingMatch")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument()
  })

  it("shows sell order with correct color", () => {
    const orders = [
      {
        orderId: "o1",
        symbol: "BTCUSD",
        side: "sell",
        price: "1000000000000000000",
        originalQuantity: "500000000000000000",
        filledQuantity: "0",
        status: "PendingMatch",
        createdAt: "2024-01-01",
      },
    ]
    mockUseOpenOrders.mockReturnValue({
      data: { orders },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    render(<OpenOrders />, { wrapper: createWrapper() })
    const sideCell = screen.getByText("sell")
    expect(sideCell.className).toContain("red")
  })

  it("calls cancel mutation when Cancel button is clicked", () => {
    const orders = [
      {
        orderId: "o1",
        symbol: "BTCUSD",
        side: "buy",
        price: "1000000000000000000",
        originalQuantity: "500000000000000000",
        filledQuantity: "0",
        status: "PendingMatch",
        createdAt: "2024-01-01",
      },
    ]
    mockUseOpenOrders.mockReturnValue({
      data: { orders },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    render(<OpenOrders />, { wrapper: createWrapper() })
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    expect(defaultCancelMutate).toHaveBeenCalledWith({
      orderId: "o1",
      symbol: "BTCUSD",
      side: "buy",
      price: "1000000000000000000",
    })
  })

  it("disables Cancel button when isPending is true", () => {
    const orders = [
      {
        orderId: "o1",
        symbol: "BTCUSD",
        side: "buy",
        price: "1000000000000000000",
        originalQuantity: "500000000000000000",
        filledQuantity: "0",
        status: "PendingMatch",
        createdAt: "2024-01-01",
      },
    ]
    mockUseOpenOrders.mockReturnValue({
      data: { orders },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    mockUseCancelOrder.mockReturnValue({
      mutate: defaultCancelMutate,
      isPending: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    render(<OpenOrders />, { wrapper: createWrapper() })
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled()
  })
})
