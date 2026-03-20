"use client"

import { useRecentTrades } from "@/hooks/useRecentTrades"
import { useTradingStore } from "@/stores/trading.store"
import { fromFixed } from "@/lib/utils/format"
import { cn } from "@/lib/utils/cn"

export function TradesFeed() {
  const symbol = useTradingStore((s) => s.symbol)
  const { data } = useRecentTrades(symbol)

  if (data.trades.length === 0) {
    return <div className="text-zinc-500 text-xs p-2">Waiting for trades…</div>
  }

  return (
    <div className="flex flex-col overflow-y-auto h-full">
      <div className="grid grid-cols-3 text-zinc-500 text-xs px-2 py-1 border-b border-zinc-800">
        <span>Price</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Time</span>
      </div>
      {data.trades.map((trade) => {
        const ns = BigInt(trade.timestampNs)
        const ms = Number(ns / 1_000_000n)
        const timeStr = new Date(ms).toLocaleTimeString()
        return (
          <div
            key={trade.tradeId}
            className="grid grid-cols-3 text-xs px-2 py-0.5 font-mono hover:bg-zinc-800/50"
          >
            <span
              className={cn(
                trade.side === "buy" ? "text-green-400" : "text-red-400"
              )}
            >
              {fromFixed(trade.price)}
            </span>
            <span className="text-right text-zinc-300">{fromFixed(trade.quantity)}</span>
            <span className="text-right text-zinc-500">{timeStr}</span>
          </div>
        )
      })}
    </div>
  )
}
