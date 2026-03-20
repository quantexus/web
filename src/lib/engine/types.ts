export interface PriceLevelEntry {
  price: string
  quantity: string
}

export interface OrderBookResponse {
  bids: PriceLevelEntry[]
  asks: PriceLevelEntry[]
}

export interface PlaceOrderRequest {
  userId: string
  symbol: string
  side: "buy" | "sell"
  orderType: "limit" | "market"
  price: string
  quantity: string
}

export interface PlaceOrderResponse {
  orderId: string
  status: string
}

export interface CancelOrderRequest {
  orderId: string
  symbol: string
  side: string
  price: string
}

export interface CancelOrderResponse {
  success: boolean
}

export interface AssetBalance {
  asset: string
  available: string
  reserved: string
}

export interface TradeEntry {
  tradeId: string
  price: string
  quantity: string
  side: string
  timestampNs: string
}

export interface OrderEntry {
  orderId: string
  symbol: string
  side: string
  price: string
  originalQuantity: string
  filledQuantity: string
  status: string
  createdAt: string
}

export interface SetBalanceRequest {
  userId: string
  asset: string
  available: string
  reserved: string
}

export interface SetBalanceResponse {
  success: boolean
}
