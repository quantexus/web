# Project Status — Quantexus Web Terminal

## Current Phase: Phase 3 — Full Test Suite (In Progress)

---

## Phase Index

| Phase | Status | Doc |
|-------|--------|-----|
| Phase 1 — MVP Trading Terminal | ✅ Complete | [docs/phases/phase1.md](phases/phase1.md) |
| Phase 2 — Live Updates (SSE + NATS) | ✅ Complete | [docs/phases/phase2.md](phases/phase2.md) |
| Phase 3 — Full Test Suite (100% Coverage) | 🔄 In Progress | [docs/phases/phase3.md](phases/phase3.md) |
| Phase 4 — Multi-Symbol & Portfolio | ⏳ Planned | — |
| Phase 5 — Advanced Features | ⏳ Planned | — |

---

## Phase 4 Preview — Multi-Symbol & Portfolio

- Symbol list fetched dynamically from engine
- Per-symbol routing (`/trade/[symbol]`)
- Portfolio panel: all balances across all assets
- Full order history table (paginated, from PostgreSQL)

## Phase 5 Preview — Advanced Features

- Price chart (candlestick — TradingView Lightweight Charts)
- P&L display
- Proper auth (replace manual userId)
- Responsive layout (tablet/mobile)
- Order form: pre-fill price from order book click
