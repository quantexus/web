import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { TradesFeed } from "./TradesFeed"
import { useTradingStore } from "@/stores/trading.store"

vi.mock("@/hooks/useRecentTrades", () => ({
  useRecentTrades: vi.fn(),
}))

import { useRecentTrades } from "@/hooks/useRecentTrades"

const mockUseRecentTrades = vi.mocked(useRecentTrades)

describe("TradesFeed", () => {
  beforeEach(() => {
    useTradingStore.setState({ symbol: "BTCUSD", baseAsset: "BTC", quoteAsset: "USD", side: "buy", orderType: "limit" })
  })

  it("shows waiting message when trades list is empty", () => {
    mockUseRecentTrades.mockReturnValue({ data: { trades: [] } })
    render(<TradesFeed />)
    expect(screen.getByText("Waiting for trades…")).toBeInTheDocument()
  })

  it("renders trades when data is available", () => {
    const trades = [
      {
        tradeId: "t1",
        price: "1000000000000000000",
        quantity: "500000000000000000",
        side: "buy",
        timestampNs: "1000000000000000",
      },
    ]
    mockUseRecentTrades.mockReturnValue({ data: { trades } })
    render(<TradesFeed />)
    expect(screen.getByText("1.000000")).toBeInTheDocument()
    expect(screen.getByText("0.500000")).toBeInTheDocument()
  })

  it("shows green color for buy trades", () => {
    const trades = [
      {
        tradeId: "t1",
        price: "1000000000000000000",
        quantity: "500000000000000000",
        side: "buy",
        timestampNs: "1000000000000000",
      },
    ]
    mockUseRecentTrades.mockReturnValue({ data: { trades } })
    render(<TradesFeed />)
    const priceEl = screen.getByText("1.000000")
    expect(priceEl.className).toContain("green")
  })

  it("shows red color for sell trades", () => {
    const trades = [
      {
        tradeId: "t1",
        price: "1000000000000000000",
        quantity: "500000000000000000",
        side: "sell",
        timestampNs: "1000000000000000",
      },
    ]
    mockUseRecentTrades.mockReturnValue({ data: { trades } })
    render(<TradesFeed />)
    const priceEl = screen.getByText("1.000000")
    expect(priceEl.className).toContain("red")
  })

  it("renders column headers for trades list", () => {
    const trades = [
      {
        tradeId: "t1",
        price: "1000000000000000000",
        quantity: "500000000000000000",
        side: "buy",
        timestampNs: "1000000000000000",
      },
    ]
    mockUseRecentTrades.mockReturnValue({ data: { trades } })
    render(<TradesFeed />)
    expect(screen.getByText("Price")).toBeInTheDocument()
    expect(screen.getByText("Qty")).toBeInTheDocument()
    expect(screen.getByText("Time")).toBeInTheDocument()
  })

  it("passes symbol from trading store to useRecentTrades", () => {
    useTradingStore.setState({ symbol: "ETHUSD", baseAsset: "ETH", quoteAsset: "USD", side: "buy", orderType: "limit" })
    mockUseRecentTrades.mockReturnValue({ data: { trades: [] } })
    render(<TradesFeed />)
    expect(mockUseRecentTrades).toHaveBeenCalledWith("ETHUSD")
  })
})
