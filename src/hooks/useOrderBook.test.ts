import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useOrderBook } from "./useOrderBook"
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

describe("useOrderBook", () => {
  beforeEach(() => {
    mockEventSourceInstances = []
    MockEventSource.mockClear()
    globalThis.EventSource = MockEventSource as unknown as typeof EventSource
    useStreamStore.setState({ orderbookStatus: "connecting", tradesStatus: "connecting" })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns null data and isLoading true initially", () => {
    const { result } = renderHook(() => useOrderBook("BTCUSD"))
    expect(result.current.data).toBeNull()
    expect(result.current.isLoading).toBe(true)
  })

  it("does not create EventSource when symbol is empty", () => {
    renderHook(() => useOrderBook(""))
    expect(MockEventSource).not.toHaveBeenCalled()
  })

  it("creates EventSource with correct URL", () => {
    renderHook(() => useOrderBook("BTCUSD", 10))
    expect(MockEventSource).toHaveBeenCalledWith("/api/stream/orderbook/BTCUSD?depth=10")
  })

  it("sets orderbookStatus to connecting when symbol is provided", () => {
    renderHook(() => useOrderBook("BTCUSD"))
    expect(useStreamStore.getState().orderbookStatus).toBe("connecting")
  })

  it("sets orderbookStatus to connected on open", () => {
    renderHook(() => useOrderBook("BTCUSD"))
    act(() => {
      mockEventSourceInstances[0].onopen?.()
    })
    expect(useStreamStore.getState().orderbookStatus).toBe("connected")
  })

  it("updates data and status on message", () => {
    const { result } = renderHook(() => useOrderBook("BTCUSD"))
    const bookData = { bids: [{ price: "1000000000000000000", quantity: "500000000000000000" }], asks: [] }

    act(() => {
      mockEventSourceInstances[0].onmessage?.({ data: JSON.stringify(bookData) })
    })

    expect(result.current.data).toEqual(bookData)
    expect(result.current.isLoading).toBe(false)
    expect(useStreamStore.getState().orderbookStatus).toBe("connected")
  })

  it("sets orderbookStatus to disconnected on error", () => {
    renderHook(() => useOrderBook("BTCUSD"))
    act(() => {
      mockEventSourceInstances[0].onerror?.()
    })
    expect(useStreamStore.getState().orderbookStatus).toBe("disconnected")
  })

  it("closes EventSource on unmount", () => {
    const { unmount } = renderHook(() => useOrderBook("BTCUSD"))
    unmount()
    expect(mockEventSourceInstances[0].close).toHaveBeenCalled()
  })

  it("uses default depth of 15", () => {
    renderHook(() => useOrderBook("BTCUSD"))
    expect(MockEventSource).toHaveBeenCalledWith("/api/stream/orderbook/BTCUSD?depth=15")
  })
})
