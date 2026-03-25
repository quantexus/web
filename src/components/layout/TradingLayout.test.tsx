import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { TradingLayout } from "./TradingLayout"
import { useTradingStore } from "@/stores/trading.store"
import { useStreamStore } from "@/stores/stream.store"
import { useSessionStore } from "@/stores/session.store"
import { createWrapper } from "@/test/utils"

// Mock all child components that require complex setup
vi.mock("@/hooks/useOrderBook", () => ({
  useOrderBook: vi.fn(() => ({ data: null, isLoading: true })),
}))

vi.mock("@/hooks/useRecentTrades", () => ({
  useRecentTrades: vi.fn(() => ({ data: { trades: [] } })),
}))

vi.mock("@/hooks/useBalances", () => ({
  useBalances: vi.fn(() => ({ data: undefined })),
}))

vi.mock("@/hooks/useOpenOrders", () => ({
  useOpenOrders: vi.fn(() => ({ data: undefined })),
}))

vi.mock("@/hooks/usePlaceOrder", () => ({
  usePlaceOrder: vi.fn(() => ({ mutate: vi.fn(), isPending: false, error: null })),
}))

vi.mock("@/hooks/useCancelOrder", () => ({
  useCancelOrder: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))

vi.mock("@/hooks/useSetBalance", () => ({
  useSetBalance: vi.fn(() => ({ mutate: vi.fn(), isPending: false, error: null })),
}))

describe("TradingLayout", () => {
  beforeEach(() => {
    useTradingStore.setState({ symbol: "", baseAsset: "", quoteAsset: "", side: "buy", orderType: "limit" })
    useStreamStore.setState({ orderbookStatus: "connecting", tradesStatus: "connecting" })
    useSessionStore.setState({ userId: "" })
  })

  it("renders all section labels", () => {
    render(<TradingLayout symbol="BTCUSD" baseAsset="BTC" quoteAsset="USD" />, {
      wrapper: createWrapper(),
    })
    expect(screen.getByText("ORDER BOOK")).toBeInTheDocument()
    expect(screen.getByText("NEW ORDER")).toBeInTheDocument()
    expect(screen.getByText("BALANCES")).toBeInTheDocument()
    expect(screen.getByText("OPEN ORDERS")).toBeInTheDocument()
    expect(screen.getByText("RECENT TRADES")).toBeInTheDocument()
  })

  it("sets symbol, baseAsset, and quoteAsset in trading store on mount", () => {
    render(<TradingLayout symbol="BTCUSD" baseAsset="BTC" quoteAsset="USD" />, {
      wrapper: createWrapper(),
    })
    const state = useTradingStore.getState()
    expect(state.symbol).toBe("BTCUSD")
    expect(state.baseAsset).toBe("BTC")
    expect(state.quoteAsset).toBe("USD")
  })

  it("renders header with symbol", () => {
    render(<TradingLayout symbol="ETHUSD" baseAsset="ETH" quoteAsset="USD" />, {
      wrapper: createWrapper(),
    })
    expect(screen.getByText("Quantexus")).toBeInTheDocument()
  })
})
