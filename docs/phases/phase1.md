# Phase 1 — MVP Trading Terminal ✅ Complete

**Goal:** A fully functional trading terminal connected to a live engine. All panels operational.

---

## Acceptance Criteria

- [x] Next.js project scaffolded (App Router, TypeScript, Tailwind)
- [x] shadcn/ui configured (minimal hand-written Button, Input, Label components)
- [x] TanStack Query + Zustand wired (providers in root layout)
- [x] gRPC client (`src/lib/engine/client.ts`) connecting to engine (server-side only)
- [x] Fixed-point format utilities (`src/lib/utils/format.ts`) — BigInt only, no parseFloat
- [x] BFF API routes: orderbook, balances, trades, place order, cancel order, open orders
- [x] `OrderBook` component — bid/ask price ladder, depth coloring
- [x] `OrderForm` component — limit/market toggle, buy/sell toggle, price + quantity inputs, submit
- [x] `TradesFeed` component — recent matched trades with price, quantity, side, time
- [x] `BalancePanel` component — available + reserved per asset
- [x] `OpenOrders` component — user's open limit orders with cancel button
- [x] Trading layout — all panels on one page
- [x] Symbol selector in header (single symbol for MVP)
- [x] User session panel — set/display userId (UUID input, persisted to localStorage)
- [x] Dark terminal theme

---

## Files Delivered

### Lib / Engine
- `src/lib/engine/client.ts` — gRPC singleton; wraps all 6 RPCs as async functions
- `src/lib/engine/types.ts` — TypeScript interfaces matching proto messages (no gRPC types in browser)
- `src/lib/engine/grpc-error.ts` — Maps gRPC status codes → HTTP status codes

### Lib / Utils
- `src/lib/utils/format.ts` — `fromFixed` / `toFixed` using BigInt; no parseFloat
- `src/lib/utils/cn.ts` — clsx + tailwind-merge utility

### Stores
- `src/stores/trading.store.ts` — Active symbol, baseAsset, quoteAsset, side, orderType
- `src/stores/session.store.ts` — userId persisted to localStorage via Zustand persist
- `src/stores/stream.store.ts` — SSE connection status for orderbook and trades streams

### Hooks
- `src/hooks/useBalances.ts` — TanStack Query; polls `/api/balances/[userId]` every 2000ms
- `src/hooks/useOpenOrders.ts` — TanStack Query; polls `/api/orders?userId=&symbol=` every 2000ms
- `src/hooks/usePlaceOrder.ts` — Mutation; POST `/api/orders`; invalidates orders + balances
- `src/hooks/useCancelOrder.ts` — Mutation; DELETE `/api/orders/[orderId]`; invalidates orders + balances
- `src/hooks/useSetBalance.ts` — Mutation; POST `/api/balances/set` (testing only)

### API Routes (BFF)
- `src/app/api/balances/[userId]/route.ts` — GET balances
- `src/app/api/balances/set/route.ts` — POST set balance (testing only)
- `src/app/api/orderbook/[symbol]/route.ts` — GET order book snapshot
- `src/app/api/orders/route.ts` — GET open orders + POST place order
- `src/app/api/orders/[orderId]/route.ts` — DELETE cancel order
- `src/app/api/trades/[symbol]/route.ts` — GET historical trades

### Components
- `src/components/ui/button.tsx` — Button variants: default, ghost, outline, destructive
- `src/components/ui/input.tsx` — Dark terminal styling
- `src/components/ui/label.tsx` — Form label
- `src/components/trading/OrderBook.tsx` — Bid/ask ladder with depth-coloring bars
- `src/components/trading/OrderForm.tsx` — Buy/sell + limit/market form
- `src/components/trading/TradesFeed.tsx` — Recent trades list
- `src/components/trading/BalancePanel.tsx` — Per-asset balances + set-balance form
- `src/components/trading/OpenOrders.tsx` — Open orders table with cancel action
- `src/components/layout/Header.tsx` — Logo, symbol, userId pill, stream status
- `src/components/layout/TradingLayout.tsx` — 4-panel grid layout

### Pages
- `src/app/page.tsx` — Redirect to `/trade/BTCUSD`
- `src/app/trade/[symbol]/page.tsx` — Main trading terminal
- `src/app/layout.tsx` — Root layout with QueryClientProvider
- `src/app/providers.tsx` — TanStack Query setup

---

## Commit

`feat: implement Phase 1 MVP trading terminal`
