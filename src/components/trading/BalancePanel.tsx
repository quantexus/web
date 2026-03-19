"use client"

import { useBalances } from "@/hooks/useBalances"
import { useSessionStore } from "@/stores/session.store"
import { fromFixed } from "@/lib/utils/format"

export function BalancePanel() {
  const userId = useSessionStore((s) => s.userId)
  const { data } = useBalances(userId)

  if (!userId) {
    return (
      <div className="text-zinc-500 text-xs p-2">Set a user ID to view balances</div>
    )
  }

  if (!data) {
    return <div className="text-zinc-500 text-xs p-2">Loading balances…</div>
  }

  if ("notImplemented" in data) {
    return (
      <div className="text-zinc-500 text-xs p-2">
        Engine not ready — balances available in Phase 7
      </div>
    )
  }

  if (data.balances.length === 0) {
    return <div className="text-zinc-500 text-xs p-2">No balances found</div>
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      {data.balances.map((b) => (
        <div key={b.asset} className="flex flex-col text-xs">
          <span className="text-zinc-400 font-medium">{b.asset}</span>
          <div className="grid grid-cols-2 text-zinc-300 font-mono mt-0.5">
            <span>Available</span>
            <span className="text-right">{fromFixed(b.available)}</span>
          </div>
          <div className="grid grid-cols-2 text-zinc-500 font-mono">
            <span>Reserved</span>
            <span className="text-right">{fromFixed(b.reserved)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
