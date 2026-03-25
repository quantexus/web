import { describe, it, expect, beforeEach } from "vitest"
import { useSessionStore } from "./session.store"

describe("useSessionStore", () => {
  beforeEach(() => {
    useSessionStore.setState({ userId: "" })
  })

  it("has empty userId by default", () => {
    expect(useSessionStore.getState().userId).toBe("")
  })

  it("setUserId updates userId", () => {
    useSessionStore.getState().setUserId("user-123")
    expect(useSessionStore.getState().userId).toBe("user-123")
  })

  it("setUserId can set an empty string", () => {
    useSessionStore.getState().setUserId("user-123")
    useSessionStore.getState().setUserId("")
    expect(useSessionStore.getState().userId).toBe("")
  })

  it("setUserId updates to a new value", () => {
    useSessionStore.getState().setUserId("first")
    useSessionStore.getState().setUserId("second")
    expect(useSessionStore.getState().userId).toBe("second")
  })
})
