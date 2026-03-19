import { useQuery } from "@tanstack/react-query"
import type { AssetBalance } from "@/lib/engine/types"

interface BalancesResponse {
  balances: AssetBalance[]
}

interface NotImplementedResponse {
  notImplemented: true
  message: string
}

export function useBalances(userId: string) {
  return useQuery<BalancesResponse | NotImplementedResponse>({
    queryKey: ["balances", userId],
    queryFn: async () => {
      const res = await fetch(`/api/balances/${userId}`)
      if (res.status === 501) {
        const data = await res.json()
        return { notImplemented: true as const, message: data.error }
      }
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    refetchInterval: 2000,
    enabled: !!userId,
  })
}
