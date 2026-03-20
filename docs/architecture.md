# Architecture — Quantexus Web Terminal

## Overview

Browser-based trading terminal for the Quantexus exchange engine. Connects to a live engine instance. Phase 1 and Phase 2 are complete — no mock data, no stubs, real-time updates via SSE.

**Guiding philosophy:** Real integration from day one. Grow in features, not in fake scaffolding.

---

## Tech Stack

| Concern | Technology | Notes |
|---------|-----------|-------|
| Framework | Next.js 14+ (App Router) | Server components, file-based routing |
| Language | TypeScript (strict) | No `any`, no implicit types on public APIs |
| Styling | Tailwind CSS | Dark terminal theme |
| UI Primitives | shadcn/ui | Accessible, Radix-backed, never edited manually |
| Server state | TanStack Query v5 + EventSource | Polling for balances/orders; SSE for order book + trades |
| Client state | Zustand | Active symbol, order form, user session |
| gRPC client | `@grpc/grpc-js` | Server-side only (in API routes) |
| NATS client | `nats` | Server-side only (in SSE stream routes) |
| Package manager | pnpm | |
| Testing | Vitest + React Testing Library | |
| Linting | ESLint + Prettier | |

---

## BFF Pattern

Browsers cannot speak HTTP/2 gRPC natively. The solution is a **Backend For Frontend** layer built into Next.js:

```
Browser
  │  HTTP/JSON (fetch + EventSource SSE)
  ▼
Next.js API Routes  (src/app/api/**/route.ts)
  │  gRPC  (@grpc/grpc-js, server-side Node.js)          NATS subscription
  ▼                                                         ▼
Quantexus Engine  (localhost:50051)              NATS  (localhost:4222)
```

- API routes are thin: validate input → call engine → return JSON.
- SSE routes (`src/app/api/stream/`) stream live data to the browser without per-browser polling.
- No gRPC types ever reach the browser.
- `ENGINE_GRPC_URL` and `NATS_URL` are server-side env vars only (no `NEXT_PUBLIC_` prefix).

### SSE Streams

| Route | Source | Pushed to browser |
|-------|--------|-------------------|
| `GET /api/stream/trades/[symbol]` | NATS `quantexus.{symbol}.trade` | `TradeEntry` on each fill |
| `GET /api/stream/orderbook/[symbol]` | gRPC `GetOrderBook` polled at 200ms | `OrderBookResponse` snapshot |

The NATS client is a singleton (`src/lib/nats/client.ts`) reused across SSE request handlers.

---

## Folder Structure

```
web/
├── src/
│   ├── app/
│   │   ├── layout.tsx                           # Root layout (providers, theme)
│   │   ├── page.tsx                             # Redirect → /trade/BTCUSD
│   │   ├── trade/
│   │   │   └── [symbol]/
│   │   │       └── page.tsx                     # Trading terminal view
│   │   └── api/                                 # BFF — proxies to engine gRPC
│   │       ├── orderbook/[symbol]/route.ts      # GET (snapshot, fallback)
│   │       ├── balances/[userId]/route.ts       # GET
│   │       ├── trades/[symbol]/route.ts         # GET  (historical seed)
│   │       ├── orders/route.ts                  # GET (open orders) + POST (place)
│   │       ├── orders/[orderId]/route.ts        # DELETE (cancel order)
│   │       └── stream/
│   │           ├── trades/[symbol]/route.ts     # SSE — real-time trades via NATS
│   │           └── orderbook/[symbol]/route.ts  # SSE — order book every 200ms
│   ├── components/
│   │   ├── ui/                             # shadcn/ui primitives
│   │   ├── trading/
│   │   │   ├── OrderBook.tsx               # Bid/ask price ladder
│   │   │   ├── OrderForm.tsx               # Place order (limit/market, buy/sell)
│   │   │   ├── TradesFeed.tsx              # Recent matched trades
│   │   │   ├── BalancePanel.tsx            # Available + reserved per asset
│   │   │   └── OpenOrders.tsx              # User's open orders with cancel button
│   │   └── layout/
│   │       ├── Header.tsx                  # Logo, symbol selector, user pill
│   │       └── TradingLayout.tsx           # Responsive panel grid
│   ├── hooks/
│   │   ├── useOrderBook.ts                 # TanStack Query: GET /api/orderbook/[symbol]
│   │   ├── useBalances.ts                  # TanStack Query: GET /api/balances/[userId]
│   │   ├── useRecentTrades.ts              # TanStack Query: GET /api/trades/[symbol]
│   │   ├── useOpenOrders.ts                # TanStack Query: GET /api/orders?userId=&symbol=
│   │   ├── usePlaceOrder.ts                # TanStack Mutation: POST /api/orders
│   │   └── useCancelOrder.ts               # TanStack Mutation: DELETE /api/orders/[orderId]
│   ├── lib/
│   │   ├── engine/
│   │   │   ├── client.ts                   # gRPC client singleton (server-side only)
│   │   │   └── types.ts                    # TS types mirroring proto messages
│   │   └── utils/
│   │       ├── format.ts                   # Fixed-point → display string (BigInt-based)
│   │       └── cn.ts                       # clsx + tailwind-merge
│   ├── stores/
│   │   ├── trading.store.ts                # Active symbol, order form side/type
│   │   ├── session.store.ts                # userId (localStorage-persisted, for testing)
│   │   └── stream.store.ts                 # SSE connection status (orderbook + trades)
│   ├── lib/
│   │   ├── engine/
│   │   │   ├── client.ts                   # gRPC client singleton (server-side only)
│   │   │   └── types.ts                    # TS types mirroring proto messages
│   │   ├── nats/
│   │   │   └── client.ts                   # NATS connection singleton (server-side only)
│   │   └── utils/
│   │       ├── format.ts                   # Fixed-point → display string (BigInt-based)
│   │       └── cn.ts                       # clsx + tailwind-merge
│   └── types/
│       └── domain.ts                       # Frontend-facing domain types
├── public/
├── docs/
├── CLAUDE.md
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── .env.example
```

---

## Engine API Surface

Defined in `../engine/proto/quantexus/v1/order_service.proto`. All six RPCs are operational (engine Phase 7 complete):

| RPC | Used by | Notes |
|-----|---------|-------|
| `PlaceOrder` | `POST /api/orders` | Returns order_id + PendingMatch status |
| `CancelOrder` | `DELETE /api/orders/[orderId]` | Releases reserved funds |
| `GetOrderBook` | `SSE /api/stream/orderbook/[symbol]` | Streamed every 200ms via SSE |
| `GetBalances` | `GET /api/balances/[userId]` | Polled every 2000ms |
| `GetRecentTrades` | `GET /api/trades/[symbol]` | Historical seed on connect; live updates via NATS SSE |
| `GetOpenOrders` | `GET /api/orders?userId=&symbol=` | Polled every 2000ms; invalidated on place/cancel |

---

## Numeric Precision

Engine encodes all financial values as 18-decimal fixed-point integers serialized as strings:
- `"1000000000000000000"` = 1.0
- `"50000000000000000000000"` = 50,000.0

`src/lib/utils/format.ts` exports:
- `fromFixed(raw: string, decimals?: number): string` — converts to display string
- `toFixed(human: string, decimals?: number): string` — converts user input to engine format

Uses `BigInt` internally. **Never pass financial strings through `parseFloat` or `Number()`.**

---

## State Management

| State | Tool | Reason |
|-------|------|--------|
| Order book, balances, trades, open orders | TanStack Query | Async, needs polling + cache |
| Active symbol, order form side/type | Zustand | Synchronous, shared across panels |
| Order form inputs (price, quantity) | React local state | Ephemeral, not shared |
| User session (userId) | Zustand + localStorage | Persisted across reloads |

---

## Polling Intervals

| Data | Delivery | Notes |
|------|----------|-------|
| Order book | SSE push every 200ms | Server-side poll → streamed to all connected browsers |
| Recent trades | NATS SSE push | Real-time on every fill; historical seed from REST on connect |
| Balances | Polled 2000ms | TanStack Query |
| Open orders | Polled 2000ms | TanStack Query; invalidated immediately on place/cancel mutation |
