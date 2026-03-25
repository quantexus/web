import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { useCancelOrder } from "./useCancelOrder"
import { createWrapper } from "@/test/utils"

describe("useCancelOrder", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("cancels order successfully", async () => {
    const responseData = { success: true }
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => responseData,
    })

    const { result } = renderHook(() => useCancelOrder(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({
        orderId: "o1",
        symbol: "BTCUSD",
        side: "buy",
        price: "1000000000000000000",
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(responseData)
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/orders/o1", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol: "BTCUSD", side: "buy", price: "1000000000000000000" }),
    })
  })

  it("throws error with data.error when response is not ok", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Order not found" }),
    })

    const { result } = renderHook(() => useCancelOrder(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({
        orderId: "o1",
        symbol: "BTCUSD",
        side: "buy",
        price: "1000000000000000000",
      })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe("Order not found")
  })

  it("uses fallback error message when no error in response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    })

    const { result } = renderHook(() => useCancelOrder(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({
        orderId: "o1",
        symbol: "BTCUSD",
        side: "buy",
        price: "1000000000000000000",
      })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe("Failed to cancel order")
  })
})
