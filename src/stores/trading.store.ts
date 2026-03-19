import { create } from "zustand"

interface TradingStore {
  symbol: string
  baseAsset: string
  quoteAsset: string
  side: "buy" | "sell"
  orderType: "limit" | "market"
  setSymbol: (s: string) => void
  setBaseAsset: (s: string) => void
  setQuoteAsset: (s: string) => void
  setSide: (s: "buy" | "sell") => void
  setOrderType: (t: "limit" | "market") => void
}

export const useTradingStore = create<TradingStore>((set) => ({
  symbol: "",
  baseAsset: "",
  quoteAsset: "",
  side: "buy",
  orderType: "limit",
  setSymbol: (symbol) => set({ symbol }),
  setBaseAsset: (baseAsset) => set({ baseAsset }),
  setQuoteAsset: (quoteAsset) => set({ quoteAsset }),
  setSide: (side) => set({ side }),
  setOrderType: (orderType) => set({ orderType }),
}))
