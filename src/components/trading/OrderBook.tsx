"use client"

import { useState } from "react"
import { useOrderBook } from "@/hooks/useOrderBook"
import { useTradingStore } from "@/stores/trading.store"
import { fromFixed } from "@/lib/utils/format"

type ViewMode = "both" | "asks" | "bids"

interface LevelWithCumulative {
  price: string
  quantity: string
  cumulative: bigint
}

function buildCumulative(levels: { price: string; quantity: string }[]): LevelWithCumulative[] {
  return levels.reduce<LevelWithCumulative[]>((acc, level) => {
    const prev = acc.length > 0 ? acc[acc.length - 1].cumulative : 0n
    acc.push({ ...level, cumulative: prev + BigInt(level.quantity) })
    return acc
  }, [])
}

function DepthBar({
  cumulative,
  maxCumulative,
  side,
}: {
  cumulative: bigint
  maxCumulative: bigint
  side: "bid" | "ask"
}) {
  const pct = maxCumulative > 0n ? Number((cumulative * 100n) / maxCumulative) : 0
  return (
    <div
      className={`absolute inset-y-0 right-0 ${
        side === "bid" ? "bg-green-500/15" : "bg-red-500/15"
      }`}
      style={{ width: `${pct}%` }}
    />
  )
}

function ViewModeButton({
  mode,
  active,
  onClick,
}: {
  mode: ViewMode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      aria-label={`Show ${mode}`}
      className={`p-1 rounded transition-opacity ${
        active ? "opacity-100" : "opacity-35 hover:opacity-60"
      }`}
    >
      <div className="flex flex-col gap-[3px] w-3.5">
        <div
          className={`h-[2px] rounded-sm ${
            mode !== "bids" ? "bg-red-400" : "bg-green-400"
          }`}
        />
        <div
          className={`h-[2px] rounded-sm ${
            mode !== "bids" ? "bg-red-400" : "bg-green-400"
          }`}
        />
        <div
          className={`h-[2px] rounded-sm ${
            mode !== "asks" ? "bg-green-400" : "bg-red-400"
          }`}
        />
        <div
          className={`h-[2px] rounded-sm ${
            mode !== "asks" ? "bg-green-400" : "bg-red-400"
          }`}
        />
      </div>
    </button>
  )
}

export function OrderBook() {
  const symbol = useTradingStore((s) => s.symbol)
  const baseAsset = useTradingStore((s) => s.baseAsset)
  const quoteAsset = useTradingStore((s) => s.quoteAsset)
  const [viewMode, setViewMode] = useState<ViewMode>("both")
  const { data, isLoading } = useOrderBook(symbol)

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 text-sm p-4">
        Loading order book…
      </div>
    )
  }

  // asks: sorted lowest-first from engine; cumulative from best ask outward
  const asksWithCumul = buildCumulative(data.asks)
  // bids: sorted highest-first from engine; cumulative from best bid outward
  const bidsWithCumul = buildCumulative(data.bids)

  const maxAskCumul = asksWithCumul.at(-1)?.cumulative ?? 0n
  const maxBidCumul = bidsWithCumul.at(-1)?.cumulative ?? 0n

  const bestBid = data.bids[0]?.price
  const bestAsk = data.asks[0]?.price
  const spread =
    bestBid && bestAsk
      ? fromFixed((BigInt(bestAsk) - BigInt(bestBid)).toString())
      : "—"

  return (
    <div className="flex flex-col h-full text-xs font-mono">
      {/* View mode toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-zinc-800">
        <ViewModeButton mode="both" active={viewMode === "both"} onClick={() => setViewMode("both")} />
        <ViewModeButton mode="asks" active={viewMode === "asks"} onClick={() => setViewMode("asks")} />
        <ViewModeButton mode="bids" active={viewMode === "bids"} onClick={() => setViewMode("bids")} />
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-3 text-zinc-500 px-2 py-1 border-b border-zinc-800">
        <span>Price({quoteAsset})</span>
        <span className="text-right">Amount({baseAsset})</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks — reversed so highest sits at top */}
      {viewMode !== "bids" && (
        <div className="flex flex-col-reverse overflow-hidden flex-1">
          {[...asksWithCumul].reverse().map((ask, i) => (
            <div
              key={i}
              className="relative grid grid-cols-3 px-2 py-[3px] hover:bg-zinc-800/40 cursor-pointer"
            >
              <DepthBar cumulative={ask.cumulative} maxCumulative={maxAskCumul} side="ask" />
              <span className="text-red-400 z-10">{fromFixed(ask.price)}</span>
              <span className="text-right text-zinc-300 z-10">{fromFixed(ask.quantity)}</span>
              <span className="text-right text-zinc-500 z-10">
                {fromFixed(ask.cumulative.toString())}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Spread row — only in "both" mode */}
      {viewMode === "both" && (
        <div className="flex items-center justify-between px-2 py-1.5 border-y border-zinc-800 bg-zinc-900/50 shrink-0">
          <span className="text-zinc-400">Spread</span>
          <span className="text-zinc-300">{spread}</span>
        </div>
      )}

      {/* Bids */}
      {viewMode !== "asks" && (
        <div className="overflow-hidden flex-1">
          {bidsWithCumul.map((bid, i) => (
            <div
              key={i}
              className="relative grid grid-cols-3 px-2 py-[3px] hover:bg-zinc-800/40 cursor-pointer"
            >
              <DepthBar cumulative={bid.cumulative} maxCumulative={maxBidCumul} side="bid" />
              <span className="text-green-400 z-10">{fromFixed(bid.price)}</span>
              <span className="text-right text-zinc-300 z-10">{fromFixed(bid.quantity)}</span>
              <span className="text-right text-zinc-500 z-10">
                {fromFixed(bid.cumulative.toString())}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
