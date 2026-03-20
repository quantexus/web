# Project Status — Quantexus Web Terminal

## Current Phase: Phase 2 — Live Updates (Complete)

---

## Roadmap

### Phase 1 — MVP Trading Terminal ✅
**Goal:** A fully functional trading terminal connected to a live engine. All panels operational.

**Acceptance criteria:**
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

### Phase 2 — Live Updates ✅
**Goal:** Replace polling with real-time push for order book and trade feed.

**Acceptance criteria:**
- [x] SSE route `GET /api/stream/trades/[symbol]` — subscribes to `quantexus.{symbol}.trade` NATS subject, streams `TradeEntry` events to browser
- [x] SSE route `GET /api/stream/orderbook/[symbol]` — polls gRPC `GetOrderBook` every 200ms server-side, streams snapshots (eliminates per-browser polling)
- [x] `useOrderBook` hook replaced with EventSource-based implementation (no browser polling)
- [x] `useRecentTrades` hook replaced with EventSource-based implementation; seeds historical trades from REST then layers real-time NATS events
- [x] Connection status indicator in header (Live / Partial / Disconnected) with green/yellow/red dot
- [x] Reconnect on disconnect — EventSource retries automatically on error
- [x] `NATS_URL` env var added to `.env.example` (server-side only)
- [x] Engine Phase 7 stubs replaced with real gRPC calls (GetBalances, GetRecentTrades, GetOpenOrders)

---

### Phase 3 — Multi-Symbol & Portfolio
**Goal:** Support multiple instruments and a full portfolio view.

**Acceptance criteria:**
- [ ] Symbol list fetched dynamically from engine
- [ ] Per-symbol routing (`/trade/[symbol]`)
- [ ] Portfolio panel: all balances across all assets
- [ ] Full order history table (paginated, from PostgreSQL)

---

### Phase 4 — Advanced Features
**Goal:** Production-quality exchange UI.

**Acceptance criteria:**
- [ ] Price chart (candlestick — TradingView Lightweight Charts)
- [ ] P&L display
- [ ] Proper auth (replace manual userId)
- [ ] Responsive layout (tablet/mobile)
- [ ] Order form: pre-fill price from order book click
