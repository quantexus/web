import { useQuery } from "@tanstack/react-query"
import type { TradeEntry } from "@/lib/engine/types"

interface TradesResponse {
  trades: TradeEntry[]
}

interface NotImplementedResponse {
  notImplemented: true
  message: string
}

export function useRecentTrades(symbol: string, limit = 30) {
  return useQuery<TradesResponse | NotImplementedResponse>({
    queryKey: ["trades", symbol, limit],
    queryFn: async () => {
      const res = await fetch(`/api/trades/${symbol}?limit=${limit}`)
      if (res.status === 501) {
        const data = await res.json()
        return { notImplemented: true as const, message: data.error }
      }
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    refetchInterval: 1000,
    enabled: !!symbol,
  })
}
