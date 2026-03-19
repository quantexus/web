import { useQuery } from "@tanstack/react-query"
import type { OrderBookResponse } from "@/lib/engine/types"

export function useOrderBook(symbol: string, depth = 15) {
  return useQuery<OrderBookResponse>({
    queryKey: ["orderbook", symbol, depth],
    queryFn: async () => {
      const res = await fetch(`/api/orderbook/${symbol}?depth=${depth}`)
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    refetchInterval: 500,
    enabled: !!symbol,
  })
}
