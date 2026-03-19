import { NextRequest, NextResponse } from "next/server"
import { getOpenOrders, placeOrder } from "@/lib/engine/client"
import { grpcToHttp, type GrpcError } from "@/lib/engine/grpc-error"

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId") ?? ""
  const symbol = request.nextUrl.searchParams.get("symbol") ?? ""
  try {
    const data = await getOpenOrders(userId, symbol)
    return NextResponse.json(data)
  } catch (err) {
    const e = err as GrpcError
    return NextResponse.json({ error: e.message }, { status: grpcToHttp(e.code) })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = await placeOrder(body)
    return NextResponse.json(data)
  } catch (err) {
    const e = err as GrpcError
    return NextResponse.json({ error: e.message }, { status: grpcToHttp(e.code) })
  }
}
