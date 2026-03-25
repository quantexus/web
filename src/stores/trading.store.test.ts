import { describe, it, expect, beforeEach } from "vitest"
import { useTradingStore } from "./trading.store"

const initialState = {
  symbol: "",
  baseAsset: "",
  quoteAsset: "",
  side: "buy" as const,
  orderType: "limit" as const,
}

describe("useTradingStore", () => {
  beforeEach(() => {
    useTradingStore.setState(initialState)
  })

  it("has correct initial state", () => {
    const state = useTradingStore.getState()
    expect(state.symbol).toBe("")
    expect(state.baseAsset).toBe("")
    expect(state.quoteAsset).toBe("")
    expect(state.side).toBe("buy")
    expect(state.orderType).toBe("limit")
  })

  it("setSymbol updates symbol", () => {
    useTradingStore.getState().setSymbol("BTCUSD")
    expect(useTradingStore.getState().symbol).toBe("BTCUSD")
  })

  it("setBaseAsset updates baseAsset", () => {
    useTradingStore.getState().setBaseAsset("BTC")
    expect(useTradingStore.getState().baseAsset).toBe("BTC")
  })

  it("setQuoteAsset updates quoteAsset", () => {
    useTradingStore.getState().setQuoteAsset("USD")
    expect(useTradingStore.getState().quoteAsset).toBe("USD")
  })

  it("setSide updates side to sell", () => {
    useTradingStore.getState().setSide("sell")
    expect(useTradingStore.getState().side).toBe("sell")
  })

  it("setSide updates side to buy", () => {
    useTradingStore.getState().setSide("sell")
    useTradingStore.getState().setSide("buy")
    expect(useTradingStore.getState().side).toBe("buy")
  })

  it("setOrderType updates orderType to market", () => {
    useTradingStore.getState().setOrderType("market")
    expect(useTradingStore.getState().orderType).toBe("market")
  })

  it("setOrderType updates orderType to limit", () => {
    useTradingStore.getState().setOrderType("market")
    useTradingStore.getState().setOrderType("limit")
    expect(useTradingStore.getState().orderType).toBe("limit")
  })
})
