"use client"

import { useOrderBook } from "@/hooks/useOrderBook"
import { useTradingStore } from "@/stores/trading.store"
import { fromFixed } from "@/lib/utils/format"

function DepthBar({ quantity, max }: { quantity: string; max: bigint }) {
  const q = BigInt(quantity)
  const pct = max > 0n ? Number((q * 100n) / max) : 0
  return (
    <div
      className="absolute inset-y-0 right-0 opacity-20 rounded-sm"
      style={{ width: `${pct}%` }}
    />
  )
}

export function OrderBook() {
  const symbol = useTradingStore((s) => s.symbol)
  const { data, isLoading } = useOrderBook(symbol)

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 text-sm p-4">
        Loading order book…
      </div>
    )
  }

  const maxBid = data.bids.reduce((m, b) => {
    const q = BigInt(b.quantity)
    return q > m ? q : m
  }, 0n)
  const maxAsk = data.asks.reduce((m, a) => {
    const q = BigInt(a.quantity)
    return q > m ? q : m
  }, 0n)

  const bestBid = data.bids[0]?.price
  const bestAsk = data.asks[0]?.price
  const spread =
    bestBid && bestAsk
      ? fromFixed((BigInt(bestAsk) - BigInt(bestBid)).toString())
      : "—"

  return (
    <div className="flex flex-col h-full text-xs font-mono">
      <div className="grid grid-cols-2 text-zinc-500 px-2 py-1 border-b border-zinc-800">
        <span>Price</span>
        <span className="text-right">Quantity</span>
      </div>

      {/* Asks — lowest first after reverse, so highest is at top */}
      <div className="flex flex-col-reverse overflow-hidden flex-1">
        {[...data.asks].reverse().map((ask, i) => (
          <div
            key={i}
            className="relative grid grid-cols-2 px-2 py-0.5 hover:bg-zinc-800/50"
          >
            <DepthBar quantity={ask.quantity} max={maxAsk} />
            <span className="text-red-400 z-10">{fromFixed(ask.price)}</span>
            <span className="text-right text-zinc-300 z-10">{fromFixed(ask.quantity)}</span>
          </div>
        ))}
      </div>

      {/* Spread row */}
      <div className="grid grid-cols-2 px-2 py-1 border-y border-zinc-800 text-zinc-500">
        <span>Spread</span>
        <span className="text-right">{spread}</span>
      </div>

      {/* Bids */}
      <div className="overflow-hidden flex-1">
        {data.bids.map((bid, i) => (
          <div
            key={i}
            className="relative grid grid-cols-2 px-2 py-0.5 hover:bg-zinc-800/50"
          >
            <DepthBar quantity={bid.quantity} max={maxBid} />
            <span className="text-green-400 z-10">{fromFixed(bid.price)}</span>
            <span className="text-right text-zinc-300 z-10">{fromFixed(bid.quantity)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
