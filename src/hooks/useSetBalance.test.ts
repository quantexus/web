import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { useSetBalance } from "./useSetBalance"
import { createWrapper } from "@/test/utils"

describe("useSetBalance", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("sets balance successfully", async () => {
    const responseData = { success: true }
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => responseData,
    })

    const { result } = renderHook(() => useSetBalance(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({
        userId: "user1",
        asset: "BTC",
        available: "1000000000000000000",
        reserved: "0",
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(responseData)
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/balances/set", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: expect.any(String),
    })
  })

  it("throws error with data.error when response is not ok", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "User not found" }),
    })

    const { result } = renderHook(() => useSetBalance(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({
        userId: "user1",
        asset: "BTC",
        available: "1000000000000000000",
        reserved: "0",
      })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe("User not found")
  })

  it("uses fallback error message when no error in response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    })

    const { result } = renderHook(() => useSetBalance(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({
        userId: "user1",
        asset: "BTC",
        available: "1000000000000000000",
        reserved: "0",
      })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe("Failed to set balance")
  })
})
