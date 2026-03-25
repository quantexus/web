# Phase 3 — Full Test Suite (100% Coverage)

**Goal:** Every production source file has tests. Coverage thresholds (statements, branches, functions, lines) are all enforced at 100%. No commit passes without meeting this bar.

---

## Acceptance Criteria

- [ ] `pnpm test` passes with zero failures
- [ ] `pnpm test:coverage` reports 100% on statements, branches, functions, and lines for all production files
- [ ] Coverage threshold failures block the `test:coverage` run (vitest config enforces it)
- [ ] `--passWithNoTests` removed from the `test` script — tests are now required
- [ ] No `any` types in any test file
- [ ] All API route tests mock `src/lib/engine/client.ts` only — no mocking of TanStack Query or React internals

---

## Coverage Infrastructure

### `@vitest/coverage-v8`
Must be added to devDependencies before writing the first test file:
```bash
pnpm add -D @vitest/coverage-v8
```

### `vitest.config.ts` coverage block
```ts
coverage: {
  provider: 'v8',
  include: ['src/**/*.{ts,tsx}'],
  exclude: [
    'src/test/**',
    'src/**/*.test.{ts,tsx}',
    'src/lib/engine/types.ts',   // type-only, zero runtime code
    'src/app/globals.css',
    'src/components/ui/**',      // shadcn primitives — never edited manually
  ],
  thresholds: {
    statements: 100,
    branches:   100,
    functions:  100,
    lines:      100,
  },
},
```

> **Note on `src/components/ui/`:** The shadcn primitives are third-party-sourced and never edited manually per CLAUDE.md convention. They are excluded from coverage enforcement. If they ever get custom logic added, remove the exclusion.

### `package.json` scripts
```json
"test":          "vitest run",
"test:coverage": "vitest run --coverage"
```

---

## Test Plan by Layer

Each section lists the test file path, what is being tested, and the key scenarios that must be covered for 100% branch/statement coverage.

---

### 1. `src/lib/utils/format.ts`

**File:** `src/lib/utils/format.test.ts`

| Scenario | Input | Expected |
|----------|-------|----------|
| fromFixed — standard | `"1000000000000000000"` | `"1.00"` |
| fromFixed — large price | `"50000000000000000000000"` | `"50000.00"` |
| fromFixed — zero | `"0"` | `"0.00"` |
| fromFixed — fractional | `"500000000000000000"` | `"0.50"` |
| fromFixed — custom decimals | `"1000000000000000000"`, 6 | `"1.000000"` |
| fromFixed — sub-18 digit string | `"1"` | `"0.00"` (1e-18 rounds to 0.00) |
| toFixed — integer input | `"1"` | `"1000000000000000000"` |
| toFixed — decimal input | `"0.5"` | `"500000000000000000"` |
| toFixed — large price | `"50000"` | `"50000000000000000000000"` |
| toFixed — zero | `"0"` | `"0"` |
| toFixed → fromFixed round-trip | any valid decimal | original value |

---

### 2. `src/lib/utils/cn.ts`

**File:** `src/lib/utils/cn.test.ts`

| Scenario |
|----------|
| Merges class strings without conflict |
| Deduplicates conflicting Tailwind classes (e.g. `p-2` + `p-4` → `p-4`) |
| Handles undefined / null / false inputs |
| Handles conditional object syntax |

---

### 3. `src/lib/engine/grpc-error.ts`

**File:** `src/lib/engine/grpc-error.test.ts`

Every gRPC status code branch must be exercised:

| gRPC Code | Expected HTTP |
|-----------|--------------|
| INVALID_ARGUMENT | 400 |
| NOT_FOUND | 404 |
| ALREADY_EXISTS | 409 |
| FAILED_PRECONDITION | 422 |
| UNIMPLEMENTED | 501 |
| UNAVAILABLE | 503 |
| (any other) | 500 |

---

### 4. `src/lib/engine/client.ts`

**File:** `src/lib/engine/client.test.ts`

Strategy: mock `@grpc/grpc-js` and `@grpc/proto-loader` at the module level. Test each exported function:

| Function | Scenarios |
|----------|-----------|
| `getOrderBook` | success path; gRPC error propagates |
| `placeOrder` | success; gRPC error |
| `cancelOrder` | success; gRPC error |
| `getBalances` | success; gRPC error |
| `getRecentTrades` | success; gRPC error |
| `getOpenOrders` | success; gRPC error |
| `setBalance` | success; gRPC error |
| Singleton | calling any function twice reuses same client instance |

---

### 5. `src/lib/nats/client.ts`

**File:** `src/lib/nats/client.test.ts`

Strategy: mock `nats` module.

| Scenario |
|----------|
| `getNatsClient` connects on first call |
| `getNatsClient` returns same connection on second call (singleton) |
| Connection uses `NATS_URL` env var |
| Connection failure propagates as error |

---

### 6. `src/stores/trading.store.ts`

**File:** `src/stores/trading.store.test.ts`

| Scenario |
|----------|
| Initial state shape matches defaults |
| `setSymbol` updates symbol, baseAsset, quoteAsset |
| `setSide` toggles between `buy` and `sell` |
| `setOrderType` toggles between `limit` and `market` |

---

### 7. `src/stores/session.store.ts`

**File:** `src/stores/session.store.test.ts`

| Scenario |
|----------|
| Initial userId is empty string (or persisted value) |
| `setUserId` updates userId |
| Store is persisted via localStorage (verify key name + hydration) |

---

### 8. `src/stores/stream.store.ts`

**File:** `src/stores/stream.store.test.ts`

| Scenario |
|----------|
| Initial status is `disconnected` for both streams |
| `setOrderbookStatus` updates orderbookStatus |
| `setTradesStatus` updates tradesStatus |
| Valid status values: `connecting`, `connected`, `disconnected` |

---

### 9. `src/hooks/useBalances.ts`

**File:** `src/hooks/useBalances.test.ts`

Strategy: wrap in `renderHook` with a `QueryClientProvider`. Mock `fetch`.

| Scenario |
|----------|
| Returns `undefined` data while loading |
| Returns parsed balances on success |
| Returns error state on fetch failure |
| Query key includes userId |
| Refetch interval is 2000ms |

---

### 10. `src/hooks/useOpenOrders.ts`

**File:** `src/hooks/useOpenOrders.test.ts`

| Scenario |
|----------|
| Returns loading state |
| Returns orders array on success |
| Returns error state on failure |
| Query key includes userId and symbol |
| Refetch interval is 2000ms |

---

### 11. `src/hooks/useOrderBook.ts`

**File:** `src/hooks/useOrderBook.test.ts`

Strategy: mock `EventSource` globally.

| Scenario |
|----------|
| Opens EventSource to correct URL on mount |
| Parses incoming SSE message and updates state |
| Sets stream status to `connecting` initially |
| Sets stream status to `connected` on `onopen` |
| Sets stream status to `disconnected` on `onerror` |
| Closes EventSource and resets status on unmount |

---

### 12. `src/hooks/useRecentTrades.ts`

**File:** `src/hooks/useRecentTrades.test.ts`

Strategy: mock `fetch` (seed) + mock `EventSource` (stream).

| Scenario |
|----------|
| Seeds trades from REST on mount |
| Prepends new trade from SSE event |
| Sets stream status appropriately |
| Closes EventSource on unmount |
| Handles empty seed gracefully |

---

### 13. `src/hooks/usePlaceOrder.ts`

**File:** `src/hooks/usePlaceOrder.test.ts`

Strategy: mock `fetch`. Test mutation lifecycle.

| Scenario |
|----------|
| `mutate` calls POST `/api/orders` with correct body |
| On success, invalidates `orders` and `balances` query keys |
| On error, exposes error state |

---

### 14. `src/hooks/useCancelOrder.ts`

**File:** `src/hooks/useCancelOrder.test.ts`

| Scenario |
|----------|
| `mutate` calls DELETE `/api/orders/[orderId]` |
| On success, invalidates `orders` and `balances` query keys |
| On error, exposes error state |

---

### 15. `src/hooks/useSetBalance.ts`

**File:** `src/hooks/useSetBalance.test.ts`

| Scenario |
|----------|
| `mutate` calls POST `/api/balances/set` |
| On success, invalidates `balances` query key |
| On error, exposes error state |

---

### 16. `src/app/api/balances/[userId]/route.ts`

**File:** `src/app/api/balances/[userId]/route.test.ts`

Strategy: mock `src/lib/engine/client.ts`.

| Scenario |
|----------|
| Returns 200 with balances array on success |
| Returns 400 if userId param is missing |
| Returns mapped HTTP error on gRPC failure |

---

### 17. `src/app/api/balances/set/route.ts`

**File:** `src/app/api/balances/set/route.test.ts`

| Scenario |
|----------|
| Returns 200 on success |
| Returns 400 on missing/invalid body |
| Returns mapped HTTP error on gRPC failure |

---

### 18. `src/app/api/orderbook/[symbol]/route.ts`

**File:** `src/app/api/orderbook/[symbol]/route.test.ts`

| Scenario |
|----------|
| Returns 200 with bids and asks |
| Returns 400 on missing symbol |
| Returns mapped HTTP error on gRPC failure |

---

### 19. `src/app/api/orders/route.ts`

**File:** `src/app/api/orders/route.test.ts`

| Scenario |
|----------|
| GET: returns open orders |
| GET: returns 400 on missing params |
| POST: places order, returns orderId + status |
| POST: returns 400 on invalid body |
| gRPC error → mapped HTTP error for both GET and POST |

---

### 20. `src/app/api/orders/[orderId]/route.ts`

**File:** `src/app/api/orders/[orderId]/route.test.ts`

| Scenario |
|----------|
| DELETE: cancels order, returns success |
| DELETE: returns 400 on missing orderId |
| gRPC error → mapped HTTP error |

---

### 21. `src/app/api/trades/[symbol]/route.ts`

**File:** `src/app/api/trades/[symbol]/route.test.ts`

| Scenario |
|----------|
| Returns 200 with trades array |
| Returns 400 on missing symbol |
| gRPC error → mapped HTTP error |

---

### 22. `src/app/api/stream/orderbook/[symbol]/route.ts`

**File:** `src/app/api/stream/orderbook/[symbol]/route.test.ts`

Strategy: mock `src/lib/engine/client.ts`. Intercept the `ReadableStream` controller.

| Scenario |
|----------|
| Response has `Content-Type: text/event-stream` |
| Streams `data: {...}` JSON on each poll tick |
| Closes stream when client disconnects (abort signal) |
| Returns 400 on missing symbol |

---

### 23. `src/app/api/stream/trades/[symbol]/route.ts`

**File:** `src/app/api/stream/trades/[symbol]/route.test.ts`

Strategy: mock `src/lib/nats/client.ts`.

| Scenario |
|----------|
| Response has `Content-Type: text/event-stream` |
| Subscribes to correct NATS subject `quantexus.{symbol}.trade` |
| Streams trade event as SSE `data:` line |
| Unsubscribes from NATS when client disconnects |
| Returns 400 on missing symbol |

---

### 24. `src/components/trading/OrderBook.tsx`

**File:** `src/components/trading/OrderBook.test.tsx`

| Scenario |
|----------|
| Renders "Loading…" while `isLoading` is true |
| Renders bid and ask rows with formatted price and quantity |
| Renders depth-coloring `div` on each row |
| Handles empty bids/asks arrays |
| Ask rows are sorted highest price at top |
| Bid rows are sorted highest price at top |

---

### 25. `src/components/trading/OrderForm.tsx`

**File:** `src/components/trading/OrderForm.test.tsx`

| Scenario |
|----------|
| Renders buy/sell toggle buttons |
| Renders limit/market toggle buttons |
| Price input hidden when orderType is `market` |
| Price input visible when orderType is `limit` |
| Submit calls `placeOrder` mutation with correct values |
| Submit button disabled while mutation is pending |
| Resets form on successful submission |
| Displays error message on mutation error |

---

### 26. `src/components/trading/TradesFeed.tsx`

**File:** `src/components/trading/TradesFeed.test.tsx`

| Scenario |
|----------|
| Renders "No trades yet" on empty list |
| Renders trade rows with price, quantity, timestamp |
| Buy side row has correct color class |
| Sell side row has correct color class |

---

### 27. `src/components/trading/BalancePanel.tsx`

**File:** `src/components/trading/BalancePanel.test.tsx`

| Scenario |
|----------|
| Renders balances with asset, available, reserved |
| Renders set-balance form |
| Set-balance submit calls `setBalance` mutation |
| Shows loading state while balances are fetching |
| Shows error state on fetch failure |

---

### 28. `src/components/trading/OpenOrders.tsx`

**File:** `src/components/trading/OpenOrders.test.tsx`

| Scenario |
|----------|
| Renders "No open orders" on empty list |
| Renders order rows with side, price, qty, filled, status |
| Cancel button calls `cancelOrder` mutation |
| Cancel button disabled while mutation is pending |
| Shows loading state |
| Shows error state |

---

### 29. `src/components/layout/Header.tsx`

**File:** `src/components/layout/Header.test.tsx`

| Scenario |
|----------|
| Renders logo / brand text |
| Renders active symbol |
| Renders userId pill |
| Shows green dot + "Live" when both streams connected |
| Shows yellow dot + "Partial" when one stream connected |
| Shows red dot + "Disconnected" when both streams disconnected |

---

### 30. `src/components/layout/TradingLayout.tsx`

**File:** `src/components/layout/TradingLayout.test.tsx`

| Scenario |
|----------|
| Renders all four panel slots |
| Passes children / panel props through correctly |

---

## Test Utilities

Create `src/test/utils.tsx` with shared helpers:

```ts
// Wrapper that provides QueryClient + Zustand store resets
export function renderWithProviders(ui: React.ReactElement, options?: RenderOptions)

// Minimal QueryClient for tests (no retries, no refetch on window focus)
export function createTestQueryClient(): QueryClient
```

---

## Acceptance Gate

Phase 3 is complete when:

```bash
pnpm lint        # 0 errors
pnpm typecheck   # 0 errors
pnpm test:coverage
# All test suites pass
# Coverage: statements 100%, branches 100%, functions 100%, lines 100%
```

No PR or commit may be merged until this gate passes.
