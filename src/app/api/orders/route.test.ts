import { describe, it, expect, vi, beforeEach } from "vitest"
import * as grpc from "@grpc/grpc-js"
import { NextRequest } from "next/server"

vi.mock("@/lib/engine/client", () => ({
  getOpenOrders: vi.fn(),
  placeOrder: vi.fn(),
}))

import { getOpenOrders, placeOrder } from "@/lib/engine/client"
import { GET, POST } from "./route"

const mockGetOpenOrders = vi.mocked(getOpenOrders)
const mockPlaceOrder = vi.mocked(placeOrder)

describe("GET /api/orders", () => {
  beforeEach(() => {
    mockGetOpenOrders.mockReset()
  })

  it("returns open orders on success", async () => {
    const ordersData = { orders: [] }
    mockGetOpenOrders.mockResolvedValue(ordersData)

    const request = new NextRequest("http://localhost/api/orders?userId=user1&symbol=BTCUSD")
    const response = await GET(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toEqual(ordersData)
    expect(mockGetOpenOrders).toHaveBeenCalledWith("user1", "BTCUSD")
  })

  it("uses empty string defaults when params missing", async () => {
    const ordersData = { orders: [] }
    mockGetOpenOrders.mockResolvedValue(ordersData)

    const request = new NextRequest("http://localhost/api/orders")
    await GET(request)

    expect(mockGetOpenOrders).toHaveBeenCalledWith("", "")
  })

  it("returns error JSON on gRPC failure", async () => {
    const grpcError = { code: grpc.status.UNAVAILABLE, message: "engine down" }
    mockGetOpenOrders.mockRejectedValue(grpcError)

    const request = new NextRequest("http://localhost/api/orders?userId=user1&symbol=BTCUSD")
    const response = await GET(request)

    expect(response.status).toBe(503)
    const data = await response.json()
    expect(data).toEqual({ error: "engine down" })
  })
})

describe("POST /api/orders", () => {
  beforeEach(() => {
    mockPlaceOrder.mockReset()
  })

  it("places order and returns response", async () => {
    const orderResponse = { orderId: "o1", status: "Created" }
    mockPlaceOrder.mockResolvedValue(orderResponse)

    const body = {
      userId: "user1",
      symbol: "BTCUSD",
      side: "buy",
      orderType: "limit",
      price: "1000000000000000000",
      quantity: "500000000000000000",
    }
    const request = new NextRequest("http://localhost/api/orders", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toEqual(orderResponse)
  })

  it("returns error JSON on gRPC failure", async () => {
    const grpcError = { code: grpc.status.INVALID_ARGUMENT, message: "invalid price" }
    mockPlaceOrder.mockRejectedValue(grpcError)

    const request = new NextRequest("http://localhost/api/orders", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toEqual({ error: "invalid price" })
  })
})
