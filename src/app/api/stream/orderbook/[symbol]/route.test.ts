import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"

vi.mock("@/lib/engine/client", () => ({
  getOrderBook: vi.fn(),
}))

import { getOrderBook } from "@/lib/engine/client"
import { GET, dynamic } from "./route"

const mockGetOrderBook = vi.mocked(getOrderBook)

describe("GET /api/stream/orderbook/[symbol]", () => {
  beforeEach(() => {
    mockGetOrderBook.mockReset()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("exports dynamic = force-dynamic", () => {
    expect(dynamic).toBe("force-dynamic")
  })

  it("returns SSE response with correct headers", async () => {
    const bookData = { bids: [], asks: [] }
    mockGetOrderBook.mockResolvedValue(bookData)

    const request = new NextRequest("http://localhost/api/stream/orderbook/BTCUSD")
    const response = await GET(request, { params: { symbol: "BTCUSD" } })

    expect(response.headers.get("Content-Type")).toBe("text/event-stream")
    expect(response.headers.get("Cache-Control")).toBe("no-cache")
    expect(response.headers.get("Connection")).toBe("keep-alive")
  })

  it("streams order book data as SSE events", async () => {
    const bookData = { bids: [{ price: "1000000000000000000", quantity: "500000000000000000" }], asks: [] }
    mockGetOrderBook.mockResolvedValue(bookData)

    const request = new NextRequest("http://localhost/api/stream/orderbook/BTCUSD")
    const response = await GET(request, { params: { symbol: "BTCUSD" } })

    const reader = response.body!.getReader()

    // Advance timer to trigger the interval
    await vi.advanceTimersByTimeAsync(200)

    const { value } = await reader.read()
    const text = new TextDecoder().decode(value)
    expect(text).toContain("data:")
    expect(text).toContain(JSON.stringify(bookData))

    reader.cancel()
  })

  it("uses depth from query parameter", async () => {
    mockGetOrderBook.mockResolvedValue({ bids: [], asks: [] })

    const request = new NextRequest("http://localhost/api/stream/orderbook/BTCUSD?depth=5")
    const response = await GET(request, { params: { symbol: "BTCUSD" } })
    const reader = response.body!.getReader()

    await vi.advanceTimersByTimeAsync(200)

    await reader.read()
    expect(mockGetOrderBook).toHaveBeenCalledWith("BTCUSD", 5)
    reader.cancel()
  })

  it("uses default depth of 15 when not specified", async () => {
    mockGetOrderBook.mockResolvedValue({ bids: [], asks: [] })

    const request = new NextRequest("http://localhost/api/stream/orderbook/BTCUSD")
    const response = await GET(request, { params: { symbol: "BTCUSD" } })
    const reader = response.body!.getReader()

    await vi.advanceTimersByTimeAsync(200)

    await reader.read()
    expect(mockGetOrderBook).toHaveBeenCalledWith("BTCUSD", 15)
    reader.cancel()
  })

  it("skips tick when getOrderBook throws", async () => {
    mockGetOrderBook.mockRejectedValue(new Error("engine unreachable"))

    const request = new NextRequest("http://localhost/api/stream/orderbook/BTCUSD")
    const response = await GET(request, { params: { symbol: "BTCUSD" } })
    expect(response.headers.get("Content-Type")).toBe("text/event-stream")

    // Advance timer - should not throw even though getOrderBook rejects
    await vi.advanceTimersByTimeAsync(200)
  })

  it("closes stream on abort signal", async () => {
    mockGetOrderBook.mockResolvedValue({ bids: [], asks: [] })

    const abortController = new AbortController()
    const request = {
      signal: abortController.signal,
      nextUrl: new URL("http://localhost/api/stream/orderbook/BTCUSD"),
    } as unknown as NextRequest

    const response = await GET(request, { params: { symbol: "BTCUSD" } })
    expect(response.body).not.toBeNull()

    abortController.abort()
    // Give microtasks time to process
    await vi.advanceTimersByTimeAsync(0)
  })
})
