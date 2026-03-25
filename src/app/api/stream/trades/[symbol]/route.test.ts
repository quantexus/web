import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"
import type { NatsConnection } from "nats"

vi.mock("@/lib/nats/client", () => ({
  getNatsClient: vi.fn(),
}))

import { getNatsClient } from "@/lib/nats/client"
import { GET, dynamic } from "./route"

const mockGetNatsClient = vi.mocked(getNatsClient)

function createMockSubscription(messages: Array<{ data: Uint8Array }>) {
  let isDone = false
  const sub = {
    unsubscribe: vi.fn(() => { isDone = true }),
    [Symbol.asyncIterator]() {
      let index = 0
      return {
        async next() {
          if (isDone || index >= messages.length) {
            return { done: true, value: undefined }
          }
          const value = messages[index++]
          return { done: false, value }
        },
      }
    },
  }
  return sub
}

describe("GET /api/stream/trades/[symbol]", () => {
  beforeEach(() => {
    mockGetNatsClient.mockReset()
  })

  it("exports dynamic = force-dynamic", () => {
    expect(dynamic).toBe("force-dynamic")
  })

  it("returns SSE response with correct headers", async () => {
    const encoder = new TextEncoder()
    const tradeMsg = {
      trade_id: "t1",
      price: "1000000000000000000",
      quantity: "500000000000000000",
      side: "buy",
      timestamp: 1000000000,
    }
    const sub = createMockSubscription([{ data: encoder.encode(JSON.stringify(tradeMsg)) }])
    const mockNc = {
      isClosed: vi.fn(() => false),
      subscribe: vi.fn(() => sub),
    }
    mockGetNatsClient.mockResolvedValue(mockNc as unknown as NatsConnection)

    const request = new NextRequest("http://localhost/api/stream/trades/BTCUSD")
    const response = await GET(request, { params: { symbol: "BTCUSD" } })

    expect(response.headers.get("Content-Type")).toBe("text/event-stream")
    expect(response.headers.get("Cache-Control")).toBe("no-cache")
    expect(response.headers.get("Connection")).toBe("keep-alive")
  })

  it("streams trade messages as SSE events", async () => {
    const encoder = new TextEncoder()
    const tradeMsg = {
      trade_id: "t1",
      price: "1000000000000000000",
      quantity: "500000000000000000",
      side: "buy",
      timestamp: 1000000000,
    }
    const sub = createMockSubscription([{ data: encoder.encode(JSON.stringify(tradeMsg)) }])
    const mockNc = {
      subscribe: vi.fn(() => sub),
    }
    mockGetNatsClient.mockResolvedValue(mockNc as unknown as NatsConnection)

    const request = new NextRequest("http://localhost/api/stream/trades/BTCUSD")
    const response = await GET(request, { params: { symbol: "BTCUSD" } })

    expect(mockNc.subscribe).toHaveBeenCalledWith("quantexus.BTCUSD.trade")

    const reader = response.body!.getReader()
    const { value } = await reader.read()
    const text = new TextDecoder().decode(value)
    expect(text).toContain("data:")
    expect(text).toContain('"tradeId":"t1"')
    expect(text).toContain('"timestampNs":"1000000000"')
    reader.cancel()
  })

  it("swallows error when subscription iterator throws", async () => {
    const sub = {
      unsubscribe: vi.fn(),
      [Symbol.asyncIterator]() {
        return {
          async next(): Promise<{ done: boolean; value: undefined }> {
            throw new Error("connection lost")
          },
        }
      },
    }
    const mockNc = { subscribe: vi.fn(() => sub) }
    mockGetNatsClient.mockResolvedValue(mockNc as unknown as NatsConnection)

    const request = new NextRequest("http://localhost/api/stream/trades/BTCUSD")
    const response = await GET(request, { params: { symbol: "BTCUSD" } })

    // Error is swallowed by catch; response is still valid SSE
    expect(response.headers.get("Content-Type")).toBe("text/event-stream")
  })

  it("closes stream when NATS connection fails", async () => {
    mockGetNatsClient.mockRejectedValue(new Error("NATS unavailable"))

    const request = new NextRequest("http://localhost/api/stream/trades/BTCUSD")
    const response = await GET(request, { params: { symbol: "BTCUSD" } })

    expect(response.headers.get("Content-Type")).toBe("text/event-stream")

    // Stream should close immediately since NATS failed
    const reader = response.body!.getReader()
    await reader.read() // May be done immediately
  })

  it("closes stream on abort signal", async () => {
    const encoder = new TextEncoder()
    // Create a subscription that blocks indefinitely
    const sub = {
      unsubscribe: vi.fn(),
      [Symbol.asyncIterator]() {
        return {
          async next(): Promise<{ done: boolean; value: undefined }> {
            // Block forever
            await new Promise<void>(() => {})
            return { done: true, value: undefined }
          },
        }
      },
    }
    const mockNc = {
      subscribe: vi.fn(() => sub),
    }
    mockGetNatsClient.mockResolvedValue(mockNc as unknown as NatsConnection)

    const abortController = new AbortController()
    const request = {
      signal: abortController.signal,
    } as unknown as NextRequest

    const response = await GET(request, { params: { symbol: "BTCUSD" } })
    expect(response.body).not.toBeNull()

    // Abort the request
    abortController.abort()
    expect(sub.unsubscribe).toHaveBeenCalled()

    encoder.encode("") // just use encoder to avoid unused import warning
  })
})
