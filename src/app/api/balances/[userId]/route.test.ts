import { describe, it, expect, vi, beforeEach } from "vitest"
import * as grpc from "@grpc/grpc-js"

vi.mock("@/lib/engine/client", () => ({
  getBalances: vi.fn(),
}))

import { getBalances } from "@/lib/engine/client"
import { GET } from "./route"

const mockGetBalances = vi.mocked(getBalances)

describe("GET /api/balances/[userId]", () => {
  beforeEach(() => {
    mockGetBalances.mockReset()
  })

  it("returns balances on success", async () => {
    const balancesData = { balances: [{ asset: "BTC", available: "1000000000000000000", reserved: "0" }] }
    mockGetBalances.mockResolvedValue(balancesData)

    const response = await GET(new Request("http://localhost/api/balances/user1"), {
      params: { userId: "user1" },
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toEqual(balancesData)
    expect(mockGetBalances).toHaveBeenCalledWith("user1")
  })

  it("returns error JSON with gRPC error status on failure", async () => {
    const grpcError = { code: grpc.status.NOT_FOUND, message: "user not found" }
    mockGetBalances.mockRejectedValue(grpcError)

    const response = await GET(new Request("http://localhost/api/balances/user1"), {
      params: { userId: "user1" },
    })

    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data).toEqual({ error: "user not found" })
  })

  it("returns 500 for unknown gRPC errors", async () => {
    const grpcError = { code: grpc.status.INTERNAL, message: "internal error" }
    mockGetBalances.mockRejectedValue(grpcError)

    const response = await GET(new Request("http://localhost/api/balances/user1"), {
      params: { userId: "user1" },
    })

    expect(response.status).toBe(500)
  })
})
