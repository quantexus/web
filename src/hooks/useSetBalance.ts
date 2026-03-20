import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { SetBalanceRequest, SetBalanceResponse } from "@/lib/engine/types"

export function useSetBalance() {
  const queryClient = useQueryClient()

  return useMutation<SetBalanceResponse, Error, SetBalanceRequest>({
    mutationFn: async (req) => {
      const res = await fetch("/api/balances/set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Failed to set balance")
      }
      return res.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["balances", variables.userId] })
    },
  })
}
