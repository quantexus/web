import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useRecentTrades } from "./useRecentTrades"
import { useStreamStore } from "@/stores/stream.store"

interface MockEventSourceInstance {
  onopen: (() => void) | null
  onmessage: ((e: { data: string }) => void) | null
  onerror: (() => void) | null
  close: ReturnType<typeof vi.fn>
  url: string
}

let mockEventSourceInstances: MockEventSourceInstance[] = []

const MockEventSource = vi.fn((url: string): MockEventSourceInstance => {
  const instance: MockEventSourceInstance = {
    onopen: null,
    onmessage: null,
    onerror: null,
    close: vi.fn(),
    url,
  }
  mockEventSourceInstances.push(instance)
  return instance
})

describe("useRecentTrades", () => {
  beforeEach(() => {
    mockEventSourceInstances = []
    MockEventSource.mockClear()
    globalThis.EventSource = MockEventSource as unknown as typeof EventSource
    useStreamStore.setState({ orderbookStatus: "connecting", tradesStatus: "connecting" })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns empty trades initially", () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ trades: [] }),
    })
    const { result } = renderHook(() => useRecentTrades("BTCUSD"))
    expect(result.current.data.trades).toEqual([])
  })

  it("does not create EventSource when symbol is empty", () => {
    const { result } = renderHook(() => useRecentTrades(""))
    expect(MockEventSource).not.toHaveBeenCalled()
    expect(result.current.data.trades).toEqual([])
  })

  it("creates EventSource with correct URL", () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ trades: [] }),
    })
    renderHook(() => useRecentTrades("BTCUSD"))
    expect(MockEventSource).toHaveBeenCalledWith("/api/stream/trades/BTCUSD")
  })

  it("seeds with historical trades from fetch", async () => {
    const seedTrades = [
      { tradeId: "t1", price: "1000000000000000000", quantity: "500000000000000000", side: "buy", timestampNs: "1000000000" },
    ]
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ trades: seedTrades }),
    })

    const { result } = renderHook(() => useRecentTrades("BTCUSD"))

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10))
    })

    expect(result.current.data.trades).toEqual(seedTrades)
  })

  it("sets tradesStatus to connected on open", () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ trades: [] }),
    })
    renderHook(() => useRecentTrades("BTCUSD"))
    act(() => {
      mockEventSourceInstances[0].onopen?.()
    })
    expect(useStreamStore.getState().tradesStatus).toBe("connected")
  })

  it("prepends new trade on message and limits to limit", async () => {
    const seedTrades = [
      { tradeId: "t1", price: "1000000000000000000", quantity: "500000000000000000", side: "buy", timestampNs: "1000000000" },
    ]
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ trades: seedTrades }),
    })

    const { result } = renderHook(() => useRecentTrades("BTCUSD", 2))

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10))
    })

    const newTrade = { tradeId: "t2", price: "2000000000000000000", quantity: "100000000000000000", side: "sell", timestampNs: "2000000000" }

    act(() => {
      mockEventSourceInstances[0].onmessage?.({ data: JSON.stringify(newTrade) })
    })

    expect(result.current.data.trades[0]).toEqual(newTrade)
    expect(result.current.data.trades.length).toBeLessThanOrEqual(2)
    expect(useStreamStore.getState().tradesStatus).toBe("connected")
  })

  it("sets tradesStatus to disconnected on error", () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ trades: [] }),
    })
    renderHook(() => useRecentTrades("BTCUSD"))
    act(() => {
      mockEventSourceInstances[0].onerror?.()
    })
    expect(useStreamStore.getState().tradesStatus).toBe("disconnected")
  })

  it("closes EventSource on unmount", () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ trades: [] }),
    })
    const { unmount } = renderHook(() => useRecentTrades("BTCUSD"))
    unmount()
    expect(mockEventSourceInstances[0].close).toHaveBeenCalled()
  })

  it("handles fetch error gracefully", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error"))

    const { result } = renderHook(() => useRecentTrades("BTCUSD"))

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10))
    })

    // Should not throw and should have empty trades
    expect(result.current.data.trades).toEqual([])
  })

  it("uses default limit of 30", () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ trades: [] }),
    })
    renderHook(() => useRecentTrades("BTCUSD"))
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/trades/BTCUSD?limit=30")
  })
})
