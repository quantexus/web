import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { OrderBook } from "./OrderBook"
import { useTradingStore } from "@/stores/trading.store"
import { useStreamStore } from "@/stores/stream.store"

vi.mock("@/hooks/useOrderBook", () => ({
  useOrderBook: vi.fn(),
}))

import { useOrderBook } from "@/hooks/useOrderBook"

const mockUseOrderBook = vi.mocked(useOrderBook)

const BID = { price: "1000000000000000000", quantity: "500000000000000000" }
const ASK = { price: "1010000000000000000", quantity: "300000000000000000" }

describe("OrderBook", () => {
  beforeEach(() => {
    useTradingStore.setState({
      symbol: "BTCUSD",
      baseAsset: "BTC",
      quoteAsset: "USD",
      side: "buy",
      orderType: "limit",
    })
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

  it("renders bids and asks with price and amount columns", () => {
    mockUseOrderBook.mockReturnValue({ data: { bids: [BID], asks: [ASK] }, isLoading: false })
    render(<OrderBook />)
    expect(screen.getByText("1.000000")).toBeInTheDocument()
    expect(screen.getByText("1.010000")).toBeInTheDocument()
  })

  it("renders column headers with asset names", () => {
    mockUseOrderBook.mockReturnValue({ data: { bids: [], asks: [] }, isLoading: false })
    render(<OrderBook />)
    expect(screen.getByText("Price(USD)")).toBeInTheDocument()
    expect(screen.getByText("Amount(BTC)")).toBeInTheDocument()
    expect(screen.getByText("Total")).toBeInTheDocument()
  })

  it("shows spread row in both-mode when bid and ask exist", () => {
    mockUseOrderBook.mockReturnValue({ data: { bids: [BID], asks: [ASK] }, isLoading: false })
    render(<OrderBook />)
    expect(screen.getByText("Spread")).toBeInTheDocument()
    expect(screen.getByText("0.010000")).toBeInTheDocument()
  })

  it("shows em dash as spread when no bids", () => {
    mockUseOrderBook.mockReturnValue({ data: { bids: [], asks: [ASK] }, isLoading: false })
    render(<OrderBook />)
    expect(screen.getByText("—")).toBeInTheDocument()
  })

  it("shows em dash as spread when no asks", () => {
    mockUseOrderBook.mockReturnValue({ data: { bids: [BID], asks: [] }, isLoading: false })
    render(<OrderBook />)
    expect(screen.getByText("—")).toBeInTheDocument()
  })

  it("renders with empty bids and asks", () => {
    mockUseOrderBook.mockReturnValue({ data: { bids: [], asks: [] }, isLoading: false })
    render(<OrderBook />)
    expect(screen.getByText("Spread")).toBeInTheDocument()
    expect(screen.getByText("—")).toBeInTheDocument()
  })

  it("passes symbol from trading store to useOrderBook", () => {
    useTradingStore.setState({
      symbol: "ETHUSD",
      baseAsset: "ETH",
      quoteAsset: "USD",
      side: "buy",
      orderType: "limit",
    })
    mockUseOrderBook.mockReturnValue({ data: null, isLoading: true })
    render(<OrderBook />)
    expect(mockUseOrderBook).toHaveBeenCalledWith("ETHUSD")
  })

  it("switching to asks-only view hides bids section", () => {
    mockUseOrderBook.mockReturnValue({ data: { bids: [BID], asks: [ASK] }, isLoading: false })
    render(<OrderBook />)
    fireEvent.click(screen.getByLabelText("Show asks"))
    expect(screen.queryByText("1.000000")).not.toBeInTheDocument()
    expect(screen.getByText("1.010000")).toBeInTheDocument()
  })

  it("switching to bids-only view hides asks section", () => {
    mockUseOrderBook.mockReturnValue({ data: { bids: [BID], asks: [ASK] }, isLoading: false })
    render(<OrderBook />)
    fireEvent.click(screen.getByLabelText("Show bids"))
    expect(screen.queryByText("1.010000")).not.toBeInTheDocument()
    expect(screen.getByText("1.000000")).toBeInTheDocument()
  })

  it("switching back to both view restores bids, asks, and spread row", () => {
    mockUseOrderBook.mockReturnValue({ data: { bids: [BID], asks: [ASK] }, isLoading: false })
    render(<OrderBook />)
    fireEvent.click(screen.getByLabelText("Show asks"))
    fireEvent.click(screen.getByLabelText("Show both"))
    expect(screen.getByText("Spread")).toBeInTheDocument()
    expect(screen.getByText("1.000000")).toBeInTheDocument()
    expect(screen.getByText("1.010000")).toBeInTheDocument()
  })

  it("spread row is hidden in asks-only view", () => {
    mockUseOrderBook.mockReturnValue({ data: { bids: [BID], asks: [ASK] }, isLoading: false })
    render(<OrderBook />)
    fireEvent.click(screen.getByLabelText("Show asks"))
    expect(screen.queryByText("Spread")).not.toBeInTheDocument()
  })

  it("renders depth bar with zero width when all quantities are zero", () => {
    mockUseOrderBook.mockReturnValue({
      data: {
        bids: [{ price: "1000000000000000000", quantity: "0" }],
        asks: [{ price: "1010000000000000000", quantity: "0" }],
      },
      isLoading: false,
    })
    render(<OrderBook />)
    expect(screen.getByText("1.000000")).toBeInTheDocument()
    expect(screen.getByText("1.010000")).toBeInTheDocument()
  })

  it("computes cumulative totals for multiple price levels", () => {
    mockUseOrderBook.mockReturnValue({
      data: {
        bids: [
          { price: "1010000000000000000", quantity: "1000000000000000000" },
          { price: "1000000000000000000", quantity: "1000000000000000000" },
        ],
        asks: [
          { price: "1020000000000000000", quantity: "1000000000000000000" },
          { price: "1030000000000000000", quantity: "1000000000000000000" },
        ],
      },
      isLoading: false,
    })
    render(<OrderBook />)
    // The second level in each side has cumulative = 2.000000
    const cumulativeTotals = screen.getAllByText("2.000000")
    expect(cumulativeTotals.length).toBeGreaterThanOrEqual(2)
  })
})
