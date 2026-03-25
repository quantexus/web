import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { useBalances } from "./useBalances"
import { createWrapper } from "@/test/utils"

describe("useBalances", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("is disabled when userId is empty", () => {
    const { result } = renderHook(() => useBalances(""), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe("idle")
  })

  it("fetches balances when userId is provided", async () => {
    const balancesData = { balances: [{ asset: "BTC", available: "1000000000000000000", reserved: "0" }] }
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => balancesData,
    })

    const { result } = renderHook(() => useBalances("user1"), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(balancesData)
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/balances/user1")
  })

  it("returns notImplemented when status is 501", async () => {
    const errorData = { error: "Not implemented" }
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 501,
      json: async () => errorData,
    })

    const { result } = renderHook(() => useBalances("user1"), {
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

    const { result } = renderHook(() => useBalances("user1"), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeInstanceOf(Error)
  })
})
