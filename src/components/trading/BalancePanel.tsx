"use client"

import { useState } from "react"
import { useBalances } from "@/hooks/useBalances"
import { useSetBalance } from "@/hooks/useSetBalance"
import { useSessionStore } from "@/stores/session.store"
import { fromFixed, toFixed } from "@/lib/utils/format"

export function BalancePanel() {
  const userId = useSessionStore((s) => s.userId)
  const { data } = useBalances(userId)
  const { mutate: setBalance, isPending, error } = useSetBalance()

  const [asset, setAsset] = useState("")
  const [available, setAvailable] = useState("")
  const [reserved, setReserved] = useState("")

  if (!userId) {
    return (
      <div className="text-zinc-500 text-xs p-2">Set a user ID to view balances</div>
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!asset || !available) return
    setBalance(
      {
        userId,
        asset: asset.toUpperCase(),
        available: toFixed(available),
        reserved: toFixed(reserved || "0"),
      },
      {
        onSuccess: () => {
          setAsset("")
          setAvailable("")
          setReserved("")
        },
      }
    )
  }

  return (
    <div className="flex flex-col gap-3 p-2">
      {/* Balance list */}
      {!data ? (
        <div className="text-zinc-500 text-xs">Loading balances…</div>
      ) : "notImplemented" in data ? (
        <div className="text-zinc-500 text-xs">
          Engine not ready — balances available in Phase 7
        </div>
      ) : data.balances.length === 0 ? (
        <div className="text-zinc-500 text-xs">No balances found</div>
      ) : (
        data.balances.map((b) => (
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
        ))
      )}

      {/* Set balance form */}
      <div className="border-t border-zinc-800 pt-3">
        <p className="text-zinc-500 text-xs mb-2">Set balance</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-1.5">
          <input
            className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
            placeholder="Asset (e.g. BTC)"
            value={asset}
            onChange={(e) => setAsset(e.target.value)}
          />
          <input
            className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
            placeholder="Available (e.g. 1.5)"
            value={available}
            onChange={(e) => setAvailable(e.target.value)}
          />
          <input
            className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
            placeholder="Reserved (default 0)"
            value={reserved}
            onChange={(e) => setReserved(e.target.value)}
          />
          {error && (
            <p className="text-red-400 text-xs">{error.message}</p>
          )}
          <button
            type="submit"
            disabled={isPending || !asset || !available}
            className="mt-1 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200 text-xs rounded px-2 py-1 transition-colors"
          >
            {isPending ? "Setting…" : "Set"}
          </button>
        </form>
      </div>
    </div>
  )
}
