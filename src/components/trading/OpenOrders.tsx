"use client"

import { useOpenOrders } from "@/hooks/useOpenOrders"
import { useCancelOrder } from "@/hooks/useCancelOrder"
import { useSessionStore } from "@/stores/session.store"
import { useTradingStore } from "@/stores/trading.store"
import { fromFixed } from "@/lib/utils/format"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"

export function OpenOrders() {
  const userId = useSessionStore((s) => s.userId)
  const symbol = useTradingStore((s) => s.symbol)
  const { data } = useOpenOrders(userId, symbol)
  const { mutate: cancel, isPending } = useCancelOrder()

  if (!userId) {
    return (
      <div className="text-zinc-500 text-xs p-2">Set a user ID to view orders</div>
    )
  }

  if (!data) {
    return <div className="text-zinc-500 text-xs p-2">Loading orders…</div>
  }

  if ("notImplemented" in data) {
    return (
      <div className="text-zinc-500 text-xs p-2">
        Engine not ready — open orders available in Phase 7
      </div>
    )
  }

  if (data.orders.length === 0) {
    return <div className="text-zinc-500 text-xs p-2">No open orders</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs font-mono">
        <thead>
          <tr className="text-zinc-500 border-b border-zinc-800">
            <th className="text-left p-2">Side</th>
            <th className="text-right p-2">Price</th>
            <th className="text-right p-2">Qty</th>
            <th className="text-right p-2">Filled</th>
            <th className="text-left p-2">Status</th>
            <th className="p-2" />
          </tr>
        </thead>
        <tbody>
          {data.orders.map((order) => (
            <tr
              key={order.orderId}
              className="border-b border-zinc-800/50 hover:bg-zinc-800/30"
            >
              <td
                className={cn(
                  "p-2",
                  order.side === "buy" ? "text-green-400" : "text-red-400"
                )}
              >
                {order.side}
              </td>
              <td className="text-right p-2 text-zinc-300">{fromFixed(order.price)}</td>
              <td className="text-right p-2 text-zinc-300">
                {fromFixed(order.originalQuantity)}
              </td>
              <td className="text-right p-2 text-zinc-300">
                {fromFixed(order.filledQuantity)}
              </td>
              <td className="p-2 text-zinc-400">{order.status}</td>
              <td className="p-2">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isPending}
                  onClick={() =>
                    cancel({
                      orderId: order.orderId,
                      symbol: order.symbol,
                      side: order.side,
                      price: order.price,
                    })
                  }
                  className="text-zinc-500 hover:text-red-400 h-6 px-2"
                >
                  Cancel
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
