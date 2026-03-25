import { describe, it, expect, vi, beforeEach } from "vitest"
import * as grpc from "@grpc/grpc-js"
import { NextRequest } from "next/server"

vi.mock("@/lib/engine/client", () => ({
  cancelOrder: vi.fn(),
}))

import { cancelOrder } from "@/lib/engine/client"
import { DELETE } from "./route"

const mockCancelOrder = vi.mocked(cancelOrder)

describe("DELETE /api/orders/[orderId]", () => {
  beforeEach(() => {
    mockCancelOrder.mockReset()
  })

  it("cancels order on success", async () => {
    const responseData = { success: true }
    mockCancelOrder.mockResolvedValue(responseData)

    const body = { symbol: "BTCUSD", side: "buy", price: "1000000000000000000" }
    const request = new NextRequest("http://localhost/api/orders/o1", {
      method: "DELETE",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    })

    const response = await DELETE(request, { params: { orderId: "o1" } })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toEqual(responseData)
    expect(mockCancelOrder).toHaveBeenCalledWith({ orderId: "o1", ...body })
  })

  it("returns error JSON on gRPC failure", async () => {
    const grpcError = { code: grpc.status.NOT_FOUND, message: "order not found" }
    mockCancelOrder.mockRejectedValue(grpcError)

    const request = new NextRequest("http://localhost/api/orders/o1", {
      method: "DELETE",
      body: JSON.stringify({ symbol: "BTCUSD", side: "buy", price: "0" }),
      headers: { "Content-Type": "application/json" },
    })

    const response = await DELETE(request, { params: { orderId: "o1" } })

    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data).toEqual({ error: "order not found" })
  })
})
