"use client"

import { useState, useEffect } from "react"
import type { OrderBookResponse } from "@/lib/engine/types"
import { useStreamStore } from "@/stores/stream.store"

export function useOrderBook(symbol: string, depth = 15) {
  const [data, setData] = useState<OrderBookResponse | null>(null)
  const setOrderbookStatus = useStreamStore((s) => s.setOrderbookStatus)

  useEffect(() => {
    if (!symbol) return

    setOrderbookStatus("connecting")

    const es = new EventSource(`/api/stream/orderbook/${symbol}?depth=${depth}`)

    es.onopen = () => setOrderbookStatus("connected")
    es.onmessage = (e: MessageEvent<string>) => {
      setData(JSON.parse(e.data) as OrderBookResponse)
      setOrderbookStatus("connected")
    }
    es.onerror = () => setOrderbookStatus("disconnected")

    return () => {
      es.close()
    }
  }, [symbol, depth, setOrderbookStatus])

  return { data, isLoading: data === null }
}
