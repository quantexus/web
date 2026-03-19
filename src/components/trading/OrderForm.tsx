"use client"

import { useState } from "react"
import { useTradingStore } from "@/stores/trading.store"
import { useSessionStore } from "@/stores/session.store"
import { usePlaceOrder } from "@/hooks/usePlaceOrder"
import { toFixed } from "@/lib/utils/format"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils/cn"

export function OrderForm() {
  const { symbol, baseAsset, quoteAsset, side, orderType, setSide, setOrderType } =
    useTradingStore()
  const userId = useSessionStore((s) => s.userId)
  const { mutate, isPending, error } = usePlaceOrder()

  const [price, setPrice] = useState("")
  const [quantity, setQuantity] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return

    mutate(
      {
        userId,
        symbol,
        side,
        orderType,
        price: orderType === "limit" ? toFixed(price) : "0",
        quantity: toFixed(quantity),
      },
      {
        onSuccess: () => {
          setPrice("")
          setQuantity("")
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
      {/* Side toggle */}
      <div className="grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => setSide("buy")}
          className={cn(
            "py-2 rounded font-medium text-sm transition-colors",
            side === "buy"
              ? "bg-green-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          )}
        >
          Buy {baseAsset}
        </button>
        <button
          type="button"
          onClick={() => setSide("sell")}
          className={cn(
            "py-2 rounded font-medium text-sm transition-colors",
            side === "sell"
              ? "bg-red-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          )}
        >
          Sell {baseAsset}
        </button>
      </div>

      {/* Order type toggle */}
      <div className="grid grid-cols-2 gap-1">
        {(["limit", "market"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setOrderType(t)}
            className={cn(
              "py-1.5 rounded text-sm transition-colors capitalize",
              orderType === t
                ? "bg-zinc-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Price input (limit only) */}
      {orderType === "limit" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="price">Price ({quoteAsset})</Label>
          <Input
            id="price"
            type="text"
            inputMode="decimal"
            placeholder="0.000000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
      )}

      {/* Quantity input */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="quantity">Quantity ({baseAsset})</Label>
        <Input
          id="quantity"
          type="text"
          inputMode="decimal"
          placeholder="0.000000"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
      </div>

      {/* Error message */}
      {error && <p className="text-red-400 text-xs">{error.message}</p>}

      {/* Submit */}
      <Button
        type="submit"
        disabled={isPending || !userId}
        className={cn(
          "w-full font-semibold",
          side === "buy"
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-red-600 hover:bg-red-700 text-white"
        )}
      >
        {isPending
          ? "Placing…"
          : `${side === "buy" ? "Buy" : "Sell"} ${baseAsset}`}
      </Button>

      {!userId && (
        <p className="text-zinc-500 text-xs text-center">
          Set a user ID in the header to trade
        </p>
      )}
    </form>
  )
}
