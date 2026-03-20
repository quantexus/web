"use client"

import { useState } from "react"
import { useTradingStore } from "@/stores/trading.store"
import { useSessionStore } from "@/stores/session.store"
import { useStreamStore } from "@/stores/stream.store"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils/cn"

function StreamIndicator() {
  const orderbookStatus = useStreamStore((s) => s.orderbookStatus)
  const tradesStatus = useStreamStore((s) => s.tradesStatus)

  const isLive = orderbookStatus === "connected" && tradesStatus === "connected"
  const isPartial =
    !isLive && (orderbookStatus === "connected" || tradesStatus === "connected")

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span
        className={cn(
          "inline-block w-1.5 h-1.5 rounded-full",
          isLive && "bg-green-400",
          isPartial && "bg-yellow-400",
          !isLive && !isPartial && "bg-red-500"
        )}
      />
      <span
        className={cn(
          isLive && "text-green-400",
          isPartial && "text-yellow-400",
          !isLive && !isPartial && "text-red-400"
        )}
      >
        {isLive ? "Live" : isPartial ? "Partial" : "Disconnected"}
      </span>
    </div>
  )
}

export function Header() {
  const { symbol } = useTradingStore()
  const { userId, setUserId } = useSessionStore()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState("")

  function handleUserPillClick() {
    setDraft(userId)
    setEditing(true)
  }

  function handleUserSubmit(e: React.FormEvent) {
    e.preventDefault()
    setUserId(draft.trim())
    setEditing(false)
  }

  const displayId = userId ? `${userId.slice(0, 8)}…` : "Set user ID"

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950">
      <div className="flex items-center gap-3">
        <span className="font-bold text-white tracking-tight">Quantexus</span>
        {symbol && (
          <span className="text-zinc-400 text-sm font-mono bg-zinc-800 px-2 py-0.5 rounded">
            {symbol}
          </span>
        )}
        <StreamIndicator />
      </div>

      <div>
        {editing ? (
          <form onSubmit={handleUserSubmit} className="flex gap-2">
            <Input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="User UUID"
              className="h-7 text-xs w-64"
              onBlur={() => setEditing(false)}
            />
          </form>
        ) : (
          <button
            onClick={handleUserPillClick}
            className="text-xs text-zinc-400 bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded-full transition-colors"
          >
            {displayId}
          </button>
        )}
      </div>
    </header>
  )
}
