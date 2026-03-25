import { describe, it, expect, vi } from "vitest"

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}))

import { redirect } from "next/navigation"
import HomePage from "./page"

const mockRedirect = vi.mocked(redirect)

describe("HomePage", () => {
  it("redirects to /trade/UNKNOWN when ENGINE_SYMBOL is not set", () => {
    const originalEnv = process.env.ENGINE_SYMBOL
    delete process.env.ENGINE_SYMBOL

    try {
      HomePage()
    } catch {
      // redirect() throws in some implementations
    }

    expect(mockRedirect).toHaveBeenCalledWith("/trade/UNKNOWN")
    process.env.ENGINE_SYMBOL = originalEnv
  })

  it("redirects to /trade/[ENGINE_SYMBOL] when ENGINE_SYMBOL is set", () => {
    const originalEnv = process.env.ENGINE_SYMBOL
    process.env.ENGINE_SYMBOL = "BTCUSD"

    try {
      HomePage()
    } catch {
      // redirect() throws in some implementations
    }

    expect(mockRedirect).toHaveBeenCalledWith("/trade/BTCUSD")
    process.env.ENGINE_SYMBOL = originalEnv
  })
})
