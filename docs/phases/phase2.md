# Phase 2 — Live Updates ✅ Complete

**Goal:** Replace polling with real-time push for order book and trade feed.

---

## Acceptance Criteria

- [x] SSE route `GET /api/stream/trades/[symbol]` — subscribes to `quantexus.{symbol}.trade` NATS subject, streams `TradeEntry` events to browser
- [x] SSE route `GET /api/stream/orderbook/[symbol]` — polls gRPC `GetOrderBook` every 200ms server-side, streams snapshots (eliminates per-browser polling)
- [x] `useOrderBook` hook replaced with EventSource-based implementation (no browser polling)
- [x] `useRecentTrades` hook replaced with EventSource-based implementation; seeds historical trades from REST then layers real-time NATS events
- [x] Connection status indicator in header (Live / Partial / Disconnected) with green/yellow/red dot
- [x] Reconnect on disconnect — EventSource retries automatically on error
- [x] `NATS_URL` env var added to `.env.example` (server-side only)
- [x] Engine Phase 7 stubs replaced with real gRPC calls (GetBalances, GetRecentTrades, GetOpenOrders)

---

## Files Delivered / Modified

### New — Lib / NATS
- `src/lib/nats/client.ts` — NATS singleton; lazy-connects to `NATS_URL`; reused across SSE handlers

### New — SSE Stream Routes
- `src/app/api/stream/trades/[symbol]/route.ts` — Subscribes to `quantexus.{symbol}.trade`, pipes NATS messages as SSE events
- `src/app/api/stream/orderbook/[symbol]/route.ts` — Polls gRPC GetOrderBook at 200ms, streams snapshots as SSE events

### Modified — Hooks
- `src/hooks/useOrderBook.ts` — Replaced TanStack Query polling with EventSource to `/api/stream/orderbook/[symbol]`; updates `stream.store` connection status
- `src/hooks/useRecentTrades.ts` — Seeds from `GET /api/trades/[symbol]`, then overlays real-time events from EventSource to `/api/stream/trades/[symbol]`

### Modified — Components
- `src/components/layout/Header.tsx` — Added connection status indicator reading from `stream.store`

---

## Architecture Decision

The SSE server-side polling pattern (Phase 2) consolidates N browser polling requests into a single server-side loop. The server polls gRPC once per interval regardless of how many browser clients are connected. This is intentional — reduces engine load significantly in production.

NATS is the preferred delivery mechanism for trades because it provides true push semantics aligned with the engine's fill events. The order book still requires polling as the engine exposes a query API (not a streaming RPC) for it.

---

## Commit

`feat: implement Phase 2 live updates via SSE and NATS`
