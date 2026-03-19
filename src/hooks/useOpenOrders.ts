import { useQuery } from "@tanstack/react-query"
import type { OrderEntry } from "@/lib/engine/types"

interface OpenOrdersResponse {
  orders: OrderEntry[]
}

interface NotImplementedResponse {
  notImplemented: true
  message: string
}

export function useOpenOrders(userId: string, symbol: string) {
  return useQuery<OpenOrdersResponse | NotImplementedResponse>({
    queryKey: ["openOrders", userId, symbol],
    queryFn: async () => {
      const res = await fetch(`/api/orders?userId=${userId}&symbol=${symbol}`)
      if (res.status === 501) {
        const data = await res.json()
        return { notImplemented: true as const, message: data.error }
      }
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    refetchInterval: 2000,
    enabled: !!userId && !!symbol,
  })
}
