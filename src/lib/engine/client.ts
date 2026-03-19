/**
 * Server-side only — never import this file from client components or hooks.
 * All gRPC calls happen here; BFF API routes call these functions.
 */
import * as grpc from "@grpc/grpc-js"
import * as protoLoader from "@grpc/proto-loader"
import path from "path"
import type {
  OrderBookResponse,
  PlaceOrderRequest,
  PlaceOrderResponse,
  CancelOrderRequest,
  CancelOrderResponse,
  AssetBalance,
  TradeEntry,
  OrderEntry,
} from "./types"

const PROTO_PATH = path.resolve(
  process.cwd(),
  "../engine/proto/quantexus/v1/order_service.proto"
)

// Singleton client — created once per process
let _client: grpc.Client | null = null

function createClient(): grpc.Client {
  const def = protoLoader.loadSync(PROTO_PATH, {
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
    includeDirs: [path.resolve(process.cwd(), "../engine/proto")],
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pkg = grpc.loadPackageDefinition(def) as any
  return new pkg.quantexus.v1.OrderService(
    process.env.ENGINE_GRPC_URL ?? "localhost:50051",
    grpc.credentials.createInsecure()
  )
}

function getClient(): grpc.Client {
  if (!_client) {
    _client = createClient()
  }
  return _client
}

function grpcCall<T>(method: string, request: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(getClient() as any)[method](
      request,
      (err: grpc.ServiceError | null, response: T) => {
        if (err) reject(err)
        else resolve(response)
      }
    )
  })
}

export async function getOrderBook(symbol: string, depth = 15): Promise<OrderBookResponse> {
  return grpcCall<OrderBookResponse>("GetOrderBook", { symbol, depth })
}

export async function placeOrder(req: PlaceOrderRequest): Promise<PlaceOrderResponse> {
  return grpcCall<PlaceOrderResponse>("PlaceOrder", req)
}

export async function cancelOrder(req: CancelOrderRequest): Promise<CancelOrderResponse> {
  return grpcCall<CancelOrderResponse>("CancelOrder", req)
}

// --- Phase 7 stubs — return UNIMPLEMENTED until engine supports these RPCs ---
// Parameters are accepted in the signature to preserve the interface contract but are unused until implementation.
/* eslint-disable @typescript-eslint/no-unused-vars */

export async function getBalances(
  _userId: string
): Promise<{ balances: AssetBalance[] }> {
  throw {
    code: grpc.status.UNIMPLEMENTED,
    message: "GetBalances is not yet implemented (Phase 7)",
  }
}

export async function getRecentTrades(
  _symbol: string,
  _limit = 30
): Promise<{ trades: TradeEntry[] }> {
  throw {
    code: grpc.status.UNIMPLEMENTED,
    message: "GetRecentTrades is not yet implemented (Phase 7)",
  }
}

export async function getOpenOrders(
  _userId: string,
  _symbol: string
): Promise<{ orders: OrderEntry[] }> {
  throw {
    code: grpc.status.UNIMPLEMENTED,
    message: "GetOpenOrders is not yet implemented (Phase 7)",
  }
}

/* eslint-enable @typescript-eslint/no-unused-vars */
