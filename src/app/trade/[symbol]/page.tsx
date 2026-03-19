import { TradingLayout } from "@/components/layout/TradingLayout"

export default function TradePage({ params }: { params: { symbol: string } }) {
  const baseAsset = process.env.ENGINE_BASE_ASSET ?? params.symbol.slice(0, 3)
  const quoteAsset = process.env.ENGINE_QUOTE_ASSET ?? params.symbol.slice(3)

  return (
    <TradingLayout symbol={params.symbol} baseAsset={baseAsset} quoteAsset={quoteAsset} />
  )
}
