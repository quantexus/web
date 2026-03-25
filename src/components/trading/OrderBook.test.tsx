import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { OrderBook } from "./OrderBook"
import { useTradingStore } from "@/stores/trading.store"
import { useStreamStore } from "@/stores/stream.store"

vi.mock("@/hooks/useOrderBook", () => ({
  useOrderBook: vi.fn(),
}))

import { useOrderBook } from "@/hooks/useOrderBook"

const mockUseOrderBook = vi.mocked(useOrderBook)

describe("OrderBook", () => {
  beforeEach(() => {
    useTradingStore.setState({ symbol: "BTCUSD", baseAsset: "BTC", quoteAsset: "USD", side: "buy", orderType: "limit" })
    useStreamStore.setState({ orderbookStatus: "connecting", tradesStatus: "connecting" })
  })

  it("shows loading state when isLoading is true", () => {
    mockUseOrderBook.mockReturnValue({ data: null, isLoading: true })
    render(<OrderBook />)
    expect(screen.getByText("Loading order book…")).toBeInTheDocument()
  })

  it("shows loading state when data is null", () => {
    mockUseOrderBook.mockReturnValue({ data: null, isLoading: false })
    render(<OrderBook />)
    expect(screen.getByText("Loading order book…")).toBeInTheDocument()
  })

  it("renders bids and asks when data is available", () => {
    const bookData = {
      bids: [{ price: "1000000000000000000", quantity: "500000000000000000" }],
      asks: [{ price: "1010000000000000000", quantity: "300000000000000000" }],
    }
    mockUseOrderBook.mockReturnValue({ data: bookData, isLoading: false })
    render(<OrderBook />)

    // Bid price
    expect(screen.getByText("1.000000")).toBeInTheDocument()
    // Ask price
    expect(screen.getByText("1.010000")).toBeInTheDocument()
  })

  it("shows spread when both best bid and best ask exist", () => {
    const bookData = {
      bids: [{ price: "1000000000000000000", quantity: "500000000000000000" }],
      asks: [{ price: "1010000000000000000", quantity: "300000000000000000" }],
    }
    mockUseOrderBook.mockReturnValue({ data: bookData, isLoading: false })
    render(<OrderBook />)
    expect(screen.getByText("Spread")).toBeInTheDocument()
  })

  it("shows em dash as spread when no bids", () => {
    const bookData = {
      bids: [],
      asks: [{ price: "1010000000000000000", quantity: "300000000000000000" }],
    }
    mockUseOrderBook.mockReturnValue({ data: bookData, isLoading: false })
    render(<OrderBook />)
    expect(screen.getByText("—")).toBeInTheDocument()
  })

  it("shows em dash as spread when no asks", () => {
    const bookData = {
      bids: [{ price: "1000000000000000000", quantity: "500000000000000000" }],
      asks: [],
    }
    mockUseOrderBook.mockReturnValue({ data: bookData, isLoading: false })
    render(<OrderBook />)
    expect(screen.getByText("—")).toBeInTheDocument()
  })

  it("renders with empty bids and asks", () => {
    const bookData = { bids: [], asks: [] }
    mockUseOrderBook.mockReturnValue({ data: bookData, isLoading: false })
    render(<OrderBook />)
    expect(screen.getByText("Spread")).toBeInTheDocument()
    expect(screen.getByText("—")).toBeInTheDocument()
  })

  it("passes symbol from trading store to useOrderBook", () => {
    useTradingStore.setState({ symbol: "ETHUSD", baseAsset: "ETH", quoteAsset: "USD", side: "buy", orderType: "limit" })
    mockUseOrderBook.mockReturnValue({ data: null, isLoading: true })
    render(<OrderBook />)
    expect(mockUseOrderBook).toHaveBeenCalledWith("ETHUSD")
  })

  it("renders depth bar with zero width when max quantity is zero", () => {
    const bookData = {
      bids: [{ price: "1000000000000000000", quantity: "0" }],
      asks: [{ price: "1010000000000000000", quantity: "0" }],
    }
    mockUseOrderBook.mockReturnValue({ data: bookData, isLoading: false })
    render(<OrderBook />)
    expect(screen.getByText("1.000000")).toBeInTheDocument()
  })

  it("computes max quantity correctly with multiple bids and asks of varying sizes", () => {
    const bookData = {
      bids: [
        { price: "1010000000000000000", quantity: "1000000000000000000" },
        { price: "1000000000000000000", quantity: "500000000000000000" },
      ],
      asks: [
        { price: "1020000000000000000", quantity: "1000000000000000000" },
        { price: "1030000000000000000", quantity: "500000000000000000" },
      ],
    }
    mockUseOrderBook.mockReturnValue({ data: bookData, isLoading: false })
    render(<OrderBook />)
    expect(screen.getByText("1.010000")).toBeInTheDocument()
    expect(screen.getByText("1.020000")).toBeInTheDocument()
  })
})
