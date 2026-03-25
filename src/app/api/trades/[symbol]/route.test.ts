import { describe, it, expect, vi, beforeEach } from "vitest"
import * as grpc from "@grpc/grpc-js"
import { NextRequest } from "next/server"

vi.mock("@/lib/engine/client", () => ({
  getRecentTrades: vi.fn(),
}))

import { getRecentTrades } from "@/lib/engine/client"
import { GET } from "./route"

const mockGetRecentTrades = vi.mocked(getRecentTrades)

describe("GET /api/trades/[symbol]", () => {
  beforeEach(() => {
    mockGetRecentTrades.mockReset()
  })

  it("returns recent trades on success", async () => {
    const tradesData = { trades: [{ tradeId: "t1", price: "1000000000000000000", quantity: "500000000000000000", side: "buy", timestampNs: "1000000000" }] }
    mockGetRecentTrades.mockResolvedValue(tradesData)

    const request = new NextRequest("http://localhost/api/trades/BTCUSD")
    const response = await GET(request, { params: { symbol: "BTCUSD" } })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toEqual(tradesData)
    expect(mockGetRecentTrades).toHaveBeenCalledWith("BTCUSD", 30)
  })

  it("uses limit from query parameter", async () => {
    const tradesData = { trades: [] }
    mockGetRecentTrades.mockResolvedValue(tradesData)

    const request = new NextRequest("http://localhost/api/trades/BTCUSD?limit=10")
    await GET(request, { params: { symbol: "BTCUSD" } })

    expect(mockGetRecentTrades).toHaveBeenCalledWith("BTCUSD", 10)
  })

  it("returns error JSON on gRPC failure", async () => {
    const grpcError = { code: grpc.status.UNAVAILABLE, message: "engine down" }
    mockGetRecentTrades.mockRejectedValue(grpcError)

    const request = new NextRequest("http://localhost/api/trades/BTCUSD")
    const response = await GET(request, { params: { symbol: "BTCUSD" } })

    expect(response.status).toBe(503)
    const data = await response.json()
    expect(data).toEqual({ error: "engine down" })
  })
})
