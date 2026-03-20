import { create } from "zustand"

type StreamStatus = "connecting" | "connected" | "disconnected"

interface StreamStoreState {
  orderbookStatus: StreamStatus
  tradesStatus: StreamStatus
  setOrderbookStatus: (s: StreamStatus) => void
  setTradesStatus: (s: StreamStatus) => void
}

export const useStreamStore = create<StreamStoreState>((set) => ({
  orderbookStatus: "connecting",
  tradesStatus: "connecting",
  setOrderbookStatus: (orderbookStatus) => set({ orderbookStatus }),
  setTradesStatus: (tradesStatus) => set({ tradesStatus }),
}))
