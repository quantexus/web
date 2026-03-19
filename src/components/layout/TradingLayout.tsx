"use client"

import { useEffect } from "react"
import { useTradingStore } from "@/stores/trading.store"
import { OrderBook } from "@/components/trading/OrderBook"
import { OrderForm } from "@/components/trading/OrderForm"
import { TradesFeed } from "@/components/trading/TradesFeed"
import { BalancePanel } from "@/components/trading/BalancePanel"
import { OpenOrders } from "@/components/trading/OpenOrders"
import { Header } from "@/components/layout/Header"

interface TradingLayoutProps {
  symbol: string
  baseAsset: string
  quoteAsset: string
}

export function TradingLayout({ symbol, baseAsset, quoteAsset }: TradingLayoutProps) {
  const { setSymbol, setBaseAsset, setQuoteAsset } = useTradingStore()

  useEffect(() => {
    setSymbol(symbol)
    setBaseAsset(baseAsset)
    setQuoteAsset(quoteAsset)
  }, [symbol, baseAsset, quoteAsset, setSymbol, setBaseAsset, setQuoteAsset])

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100">
      <Header />

      <div className="flex-1 grid grid-cols-[300px_280px_1fr] overflow-hidden">
        {/* Order Book */}
        <div className="border-r border-zinc-800 flex flex-col overflow-hidden">
          <div className="text-xs text-zinc-500 px-2 py-1.5 border-b border-zinc-800 font-medium shrink-0">
            ORDER BOOK
          </div>
          <div className="flex-1 overflow-hidden">
            <OrderBook />
          </div>
        </div>

        {/* Order Form */}
        <div className="border-r border-zinc-800 flex flex-col overflow-hidden">
          <div className="text-xs text-zinc-500 px-2 py-1.5 border-b border-zinc-800 font-medium shrink-0">
            NEW ORDER
          </div>
          <div className="overflow-y-auto">
            <OrderForm />
          </div>
        </div>

        {/* Right column: Balances + Open Orders */}
        <div className="flex flex-col overflow-hidden">
          <div className="shrink-0">
            <div className="text-xs text-zinc-500 px-2 py-1.5 border-b border-zinc-800 font-medium">
              BALANCES
            </div>
            <BalancePanel />
          </div>

          <div className="flex-1 flex flex-col overflow-hidden border-t border-zinc-800">
            <div className="text-xs text-zinc-500 px-2 py-1.5 border-b border-zinc-800 font-medium shrink-0">
              OPEN ORDERS
            </div>
            <div className="overflow-y-auto flex-1">
              <OpenOrders />
            </div>
          </div>
        </div>
      </div>

      {/* Trades Feed */}
      <div className="h-36 border-t border-zinc-800 flex flex-col overflow-hidden shrink-0">
        <div className="text-xs text-zinc-500 px-2 py-1.5 border-b border-zinc-800 font-medium shrink-0">
          RECENT TRADES
        </div>
        <div className="flex-1 overflow-hidden">
          <TradesFeed />
        </div>
      </div>
    </div>
  )
}
