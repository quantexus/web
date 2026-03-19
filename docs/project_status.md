# Project Status — Quantexus Web Terminal

## Current Phase: Phase 1 — MVP Trading Terminal (Scaffold Complete)

**Dependency:** Phase 7 of the engine (`../engine/tasks/phase-7-frontend-integration.md`) must be complete before `GetBalances`, `GetRecentTrades`, and `GetOpenOrders` work end-to-end. The BFF routes can be built before then — they will return errors gracefully until the engine RPCs land.

---

## Roadmap

### Phase 1 — MVP Trading Terminal
**Goal:** A fully functional trading terminal connected to a live engine. All panels operational.

**Engine dependency:** Phase 7 (new RPCs: GetBalances, GetRecentTrades, GetOpenOrders).

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
- Note: Phase 7 RPCs (GetBalances, GetRecentTrades, GetOpenOrders) return 501 gracefully until engine Phase 7 lands

---

### Phase 2 — Live Updates
**Goal:** Replace polling with real-time push for order book and trade feed.

**Acceptance criteria:**
- [ ] WebSocket or SSE endpoint added to engine (or NATS events proxied via Next.js)
- [ ] Order book updates in real time without polling
- [ ] Trade feed updates in real time
- [ ] Reconnect on disconnect with visual indicator

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
