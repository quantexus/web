import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { useOpenOrders } from "./useOpenOrders"
import { createWrapper } from "@/test/utils"

describe("useOpenOrders", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("is disabled when userId is empty", () => {
    const { result } = renderHook(() => useOpenOrders("", "BTCUSD"), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe("idle")
  })

  it("is disabled when symbol is empty", () => {
    const { result } = renderHook(() => useOpenOrders("user1", ""), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe("idle")
  })

  it("is disabled when both userId and symbol are empty", () => {
    const { result } = renderHook(() => useOpenOrders("", ""), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe("idle")
  })

  it("fetches open orders when userId and symbol are provided", async () => {
    const ordersData = { orders: [] }
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ordersData,
    })

    const { result } = renderHook(() => useOpenOrders("user1", "BTCUSD"), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(ordersData)
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/orders?userId=user1&symbol=BTCUSD")
  })

  it("returns notImplemented when status is 501", async () => {
    const errorData = { error: "Not implemented" }
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 501,
      json: async () => errorData,
    })

    const { result } = renderHook(() => useOpenOrders("user1", "BTCUSD"), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ notImplemented: true, message: "Not implemented" })
  })

  it("throws error when response is not ok (non-501)", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "Internal Server Error",
    })

    const { result } = renderHook(() => useOpenOrders("user1", "BTCUSD"), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
