import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { CancelOrderRequest, CancelOrderResponse } from "@/lib/engine/types"

export function useCancelOrder() {
  const queryClient = useQueryClient()

  return useMutation<CancelOrderResponse, Error, CancelOrderRequest>({
    mutationFn: async (req) => {
      const res = await fetch(`/api/orders/${req.orderId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: req.symbol, side: req.side, price: req.price }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Failed to cancel order")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["openOrders"] })
      queryClient.invalidateQueries({ queryKey: ["balances"] })
    },
  })
}
