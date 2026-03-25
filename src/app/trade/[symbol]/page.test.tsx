import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { useTradingStore } from "@/stores/trading.store"
import { useStreamStore } from "@/stores/stream.store"
import { useSessionStore } from "@/stores/session.store"
import { createWrapper } from "@/test/utils"

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

import TradePage from "./page"

describe("TradePage", () => {
  beforeEach(() => {
    useTradingStore.setState({ symbol: "", baseAsset: "", quoteAsset: "", side: "buy", orderType: "limit" })
    useStreamStore.setState({ orderbookStatus: "connecting", tradesStatus: "connecting" })
    useSessionStore.setState({ userId: "" })
  })

  it("renders TradingLayout with symbol from params", () => {
    render(<TradePage params={{ symbol: "BTCUSD" }} />, { wrapper: createWrapper() })
    expect(screen.getByText("ORDER BOOK")).toBeInTheDocument()
  })

  it("sets baseAsset from ENGINE_BASE_ASSET env when available", () => {
    const originalBase = process.env.ENGINE_BASE_ASSET
    const originalQuote = process.env.ENGINE_QUOTE_ASSET
    process.env.ENGINE_BASE_ASSET = "ETH"
    process.env.ENGINE_QUOTE_ASSET = "USD"

    render(<TradePage params={{ symbol: "ETHUSD" }} />, { wrapper: createWrapper() })

    const state = useTradingStore.getState()
    expect(state.baseAsset).toBe("ETH")
    expect(state.quoteAsset).toBe("USD")

    process.env.ENGINE_BASE_ASSET = originalBase
    process.env.ENGINE_QUOTE_ASSET = originalQuote
  })

  it("derives baseAsset from symbol slice when ENGINE_BASE_ASSET not set", () => {
    const originalBase = process.env.ENGINE_BASE_ASSET
    const originalQuote = process.env.ENGINE_QUOTE_ASSET
    delete process.env.ENGINE_BASE_ASSET
    delete process.env.ENGINE_QUOTE_ASSET

    render(<TradePage params={{ symbol: "BTCUSD" }} />, { wrapper: createWrapper() })

    const state = useTradingStore.getState()
    expect(state.baseAsset).toBe("BTC")
    expect(state.quoteAsset).toBe("USD")

    process.env.ENGINE_BASE_ASSET = originalBase
    process.env.ENGINE_QUOTE_ASSET = originalQuote
  })
})
