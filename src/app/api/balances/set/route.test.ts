import { describe, it, expect, vi, beforeEach } from "vitest"
import * as grpc from "@grpc/grpc-js"

vi.mock("@/lib/engine/client", () => ({
  setBalance: vi.fn(),
}))

import { setBalance } from "@/lib/engine/client"
import { POST } from "./route"

const mockSetBalance = vi.mocked(setBalance)

describe("POST /api/balances/set", () => {
  beforeEach(() => {
    mockSetBalance.mockReset()
  })

  it("returns success on valid request", async () => {
    const responseData = { success: true }
    mockSetBalance.mockResolvedValue(responseData)

    const body = { userId: "user1", asset: "BTC", available: "1000000000000000000", reserved: "0" }
    const request = new Request("http://localhost/api/balances/set", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toEqual(responseData)
    expect(mockSetBalance).toHaveBeenCalledWith(body)
  })

  it("returns error JSON with gRPC error status on failure", async () => {
    const grpcError = { code: grpc.status.INVALID_ARGUMENT, message: "invalid asset" }
    mockSetBalance.mockRejectedValue(grpcError)

    const request = new Request("http://localhost/api/balances/set", {
      method: "POST",
      body: JSON.stringify({ userId: "user1", asset: "BTC", available: "1000", reserved: "0" }),
      headers: { "Content-Type": "application/json" },
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toEqual({ error: "invalid asset" })
  })
})
