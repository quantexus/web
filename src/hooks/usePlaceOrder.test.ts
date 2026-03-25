import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { usePlaceOrder } from "./usePlaceOrder"
import { createWrapper } from "@/test/utils"

describe("usePlaceOrder", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("places order successfully", async () => {
    const responseData = { orderId: "o1", status: "Created" }
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => responseData,
    })

    const { result } = renderHook(() => usePlaceOrder(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({
        userId: "user1",
        symbol: "BTCUSD",
        side: "buy",
        orderType: "limit",
        price: "1000000000000000000",
        quantity: "500000000000000000",
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(responseData)
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: expect.any(String),
    })
  })

  it("throws error with data.error when response is not ok", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Insufficient balance" }),
    })

    const { result } = renderHook(() => usePlaceOrder(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({
        userId: "user1",
        symbol: "BTCUSD",
        side: "buy",
        orderType: "limit",
        price: "1000000000000000000",
        quantity: "500000000000000000",
      })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe("Insufficient balance")
  })

  it("uses fallback error message when no error in response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    })

    const { result } = renderHook(() => usePlaceOrder(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({
        userId: "user1",
        symbol: "BTCUSD",
        side: "buy",
        orderType: "limit",
        price: "1000000000000000000",
        quantity: "500000000000000000",
      })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe("Failed to place order")
  })
})
