import { describe, it, expect, vi, beforeEach } from "vitest"
import * as grpc from "@grpc/grpc-js"
import { NextRequest } from "next/server"

vi.mock("@/lib/engine/client", () => ({
  getOrderBook: vi.fn(),
}))

import { getOrderBook } from "@/lib/engine/client"
import { GET } from "./route"

const mockGetOrderBook = vi.mocked(getOrderBook)

describe("GET /api/orderbook/[symbol]", () => {
  beforeEach(() => {
    mockGetOrderBook.mockReset()
  })

  it("returns order book on success", async () => {
    const bookData = { bids: [{ price: "1000000000000000000", quantity: "500000000000000000" }], asks: [] }
    mockGetOrderBook.mockResolvedValue(bookData)

    const request = new NextRequest("http://localhost/api/orderbook/BTCUSD")
    const response = await GET(request, { params: { symbol: "BTCUSD" } })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toEqual(bookData)
    expect(mockGetOrderBook).toHaveBeenCalledWith("BTCUSD", 15)
  })

  it("uses depth from query parameter", async () => {
    const bookData = { bids: [], asks: [] }
    mockGetOrderBook.mockResolvedValue(bookData)

    const request = new NextRequest("http://localhost/api/orderbook/BTCUSD?depth=10")
    await GET(request, { params: { symbol: "BTCUSD" } })

    expect(mockGetOrderBook).toHaveBeenCalledWith("BTCUSD", 10)
  })

  it("returns error JSON with gRPC error status on failure", async () => {
    const grpcError = { code: grpc.status.NOT_FOUND, message: "symbol not found" }
    mockGetOrderBook.mockRejectedValue(grpcError)

    const request = new NextRequest("http://localhost/api/orderbook/BTCUSD")
    const response = await GET(request, { params: { symbol: "BTCUSD" } })

    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data).toEqual({ error: "symbol not found" })
  })
})
