import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { PlaceOrderRequest, PlaceOrderResponse } from "@/lib/engine/types"

export function usePlaceOrder() {
  const queryClient = useQueryClient()

  return useMutation<PlaceOrderResponse, Error, PlaceOrderRequest>({
    mutationFn: async (req) => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Failed to place order")
      }
      return res.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["openOrders"] })
      queryClient.invalidateQueries({ queryKey: ["balances"] })
      queryClient.invalidateQueries({ queryKey: ["orderbook", variables.symbol] })
    },
  })
}
