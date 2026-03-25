import { describe, it, expect, beforeEach } from "vitest"
import { useStreamStore } from "./stream.store"

describe("useStreamStore", () => {
  beforeEach(() => {
    useStreamStore.setState({
      orderbookStatus: "connecting",
      tradesStatus: "connecting",
    })
  })

  it("has correct initial state", () => {
    const state = useStreamStore.getState()
    expect(state.orderbookStatus).toBe("connecting")
    expect(state.tradesStatus).toBe("connecting")
  })

  it("setOrderbookStatus updates orderbookStatus to connected", () => {
    useStreamStore.getState().setOrderbookStatus("connected")
    expect(useStreamStore.getState().orderbookStatus).toBe("connected")
  })

  it("setOrderbookStatus updates orderbookStatus to disconnected", () => {
    useStreamStore.getState().setOrderbookStatus("disconnected")
    expect(useStreamStore.getState().orderbookStatus).toBe("disconnected")
  })

  it("setTradesStatus updates tradesStatus to connected", () => {
    useStreamStore.getState().setTradesStatus("connected")
    expect(useStreamStore.getState().tradesStatus).toBe("connected")
  })

  it("setTradesStatus updates tradesStatus to disconnected", () => {
    useStreamStore.getState().setTradesStatus("disconnected")
    expect(useStreamStore.getState().tradesStatus).toBe("disconnected")
  })

  it("orderbookStatus and tradesStatus are independent", () => {
    useStreamStore.getState().setOrderbookStatus("connected")
    expect(useStreamStore.getState().tradesStatus).toBe("connecting")
  })
})
