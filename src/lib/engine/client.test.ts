import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock grpc and proto-loader before importing client
const mockMethodCall = vi.fn()
const mockClientInstance = new Proxy(
  {},
  {
    get(_target, prop) {
      if (prop === "GetOrderBook") return mockMethodCall
      if (prop === "PlaceOrder") return mockMethodCall
      if (prop === "CancelOrder") return mockMethodCall
      if (prop === "GetBalances") return mockMethodCall
      if (prop === "GetRecentTrades") return mockMethodCall
      if (prop === "GetOpenOrders") return mockMethodCall
      if (prop === "SetBalance") return mockMethodCall
      return undefined
    },
  }
)

const MockOrderServiceConstructor = vi.fn(() => mockClientInstance)

vi.mock("@grpc/grpc-js", () => ({
  default: {},
  credentials: {
    createInsecure: vi.fn(() => ({})),
  },
  loadPackageDefinition: vi.fn(() => ({
    quantexus: {
      v1: {
        OrderService: MockOrderServiceConstructor,
      },
    },
  })),
  Client: vi.fn(),
}))

vi.mock("@grpc/proto-loader", () => ({
  loadSync: vi.fn(() => ({})),
}))

describe("engine client", () => {
  beforeEach(() => {
    vi.resetModules()
    mockMethodCall.mockReset()
    MockOrderServiceConstructor.mockClear()
  })

  async function loadClient() {
    return await import("./client")
  }

  it("getOrderBook calls GetOrderBook with symbol and depth", async () => {
    const expectedData = { bids: [], asks: [] }
    mockMethodCall.mockImplementation((_req: unknown, cb: (err: null, res: typeof expectedData) => void) => {
      cb(null, expectedData)
    })

    const client = await loadClient()
    const result = await client.getOrderBook("BTCUSD", 10)
    expect(result).toEqual(expectedData)
    expect(mockMethodCall).toHaveBeenCalledWith(
      { symbol: "BTCUSD", depth: 10 },
      expect.any(Function)
    )
  })

  it("getOrderBook uses default depth of 15", async () => {
    const expectedData = { bids: [], asks: [] }
    mockMethodCall.mockImplementation((_req: unknown, cb: (err: null, res: typeof expectedData) => void) => {
      cb(null, expectedData)
    })

    const client = await loadClient()
    await client.getOrderBook("BTCUSD")
    expect(mockMethodCall).toHaveBeenCalledWith(
      { symbol: "BTCUSD", depth: 15 },
      expect.any(Function)
    )
  })

  it("placeOrder calls PlaceOrder with request", async () => {
    const req = {
      userId: "u1",
      symbol: "BTCUSD",
      side: "buy" as const,
      orderType: "limit" as const,
      price: "1000000000000000000",
      quantity: "500000000000000000",
    }
    const expectedData = { orderId: "o1", status: "Created" }
    mockMethodCall.mockImplementation((_req: unknown, cb: (err: null, res: typeof expectedData) => void) => {
      cb(null, expectedData)
    })

    const client = await loadClient()
    const result = await client.placeOrder(req)
    expect(result).toEqual(expectedData)
  })

  it("cancelOrder calls CancelOrder with request", async () => {
    const req = {
      orderId: "o1",
      symbol: "BTCUSD",
      side: "buy",
      price: "1000000000000000000",
    }
    const expectedData = { success: true }
    mockMethodCall.mockImplementation((_req: unknown, cb: (err: null, res: typeof expectedData) => void) => {
      cb(null, expectedData)
    })

    const client = await loadClient()
    const result = await client.cancelOrder(req)
    expect(result).toEqual(expectedData)
  })

  it("getBalances calls GetBalances with userId", async () => {
    const expectedData = { balances: [] }
    mockMethodCall.mockImplementation((_req: unknown, cb: (err: null, res: typeof expectedData) => void) => {
      cb(null, expectedData)
    })

    const client = await loadClient()
    const result = await client.getBalances("user1")
    expect(result).toEqual(expectedData)
    expect(mockMethodCall).toHaveBeenCalledWith({ userId: "user1" }, expect.any(Function))
  })

  it("getRecentTrades calls GetRecentTrades with symbol and limit", async () => {
    const expectedData = { trades: [] }
    mockMethodCall.mockImplementation((_req: unknown, cb: (err: null, res: typeof expectedData) => void) => {
      cb(null, expectedData)
    })

    const client = await loadClient()
    const result = await client.getRecentTrades("BTCUSD", 20)
    expect(result).toEqual(expectedData)
    expect(mockMethodCall).toHaveBeenCalledWith({ symbol: "BTCUSD", limit: 20 }, expect.any(Function))
  })

  it("getRecentTrades uses default limit of 30", async () => {
    const expectedData = { trades: [] }
    mockMethodCall.mockImplementation((_req: unknown, cb: (err: null, res: typeof expectedData) => void) => {
      cb(null, expectedData)
    })

    const client = await loadClient()
    await client.getRecentTrades("BTCUSD")
    expect(mockMethodCall).toHaveBeenCalledWith({ symbol: "BTCUSD", limit: 30 }, expect.any(Function))
  })

  it("getOpenOrders calls GetOpenOrders with userId and symbol", async () => {
    const expectedData = { orders: [] }
    mockMethodCall.mockImplementation((_req: unknown, cb: (err: null, res: typeof expectedData) => void) => {
      cb(null, expectedData)
    })

    const client = await loadClient()
    const result = await client.getOpenOrders("user1", "BTCUSD")
    expect(result).toEqual(expectedData)
    expect(mockMethodCall).toHaveBeenCalledWith(
      { userId: "user1", symbol: "BTCUSD" },
      expect.any(Function)
    )
  })

  it("setBalance calls SetBalance with request", async () => {
    const req = {
      userId: "user1",
      asset: "BTC",
      available: "1000000000000000000",
      reserved: "0",
    }
    const expectedData = { success: true }
    mockMethodCall.mockImplementation((_req: unknown, cb: (err: null, res: typeof expectedData) => void) => {
      cb(null, expectedData)
    })

    const client = await loadClient()
    const result = await client.setBalance(req)
    expect(result).toEqual(expectedData)
  })

  it("rejects when gRPC returns an error", async () => {
    const grpcError = { code: 3, message: "invalid argument" }
    mockMethodCall.mockImplementation((_req: unknown, cb: (err: typeof grpcError, res: null) => void) => {
      cb(grpcError, null)
    })

    const client = await loadClient()
    await expect(client.getOrderBook("BTCUSD")).rejects.toEqual(grpcError)
  })
})
