"use client"

import { useState, useEffect } from "react"
import type { TradeEntry } from "@/lib/engine/types"
import { useStreamStore } from "@/stores/stream.store"

export function useRecentTrades(symbol: string, limit = 30) {
  const [trades, setTrades] = useState<TradeEntry[]>([])
  const setTradesStatus = useStreamStore((s) => s.setTradesStatus)

  useEffect(() => {
    if (!symbol) return

    setTradesStatus("connecting")
    setTrades([])

    // Seed with historical trades, then layer real-time updates from SSE
    fetch(`/api/trades/${symbol}?limit=${limit}`)
      .then((r) => r.json())
      .then((body: { trades: TradeEntry[] }) => setTrades(body.trades))
      .catch(() => {})

    const es = new EventSource(`/api/stream/trades/${symbol}`)

    es.onopen = () => setTradesStatus("connected")
    es.onmessage = (e: MessageEvent<string>) => {
      const trade = JSON.parse(e.data) as TradeEntry
      setTrades((prev) => [trade, ...prev].slice(0, limit))
      setTradesStatus("connected")
    }
    es.onerror = () => setTradesStatus("disconnected")

    return () => {
      es.close()
    }
  }, [symbol, limit, setTradesStatus])

  return { data: { trades } }
}
