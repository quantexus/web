import { NextRequest, NextResponse } from "next/server"
import { getRecentTrades } from "@/lib/engine/client"
import { grpcToHttp, type GrpcError } from "@/lib/engine/grpc-error"

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "30")
  try {
    const data = await getRecentTrades(params.symbol, limit)
    return NextResponse.json(data)
  } catch (err) {
    const e = err as GrpcError
    return NextResponse.json({ error: e.message }, { status: grpcToHttp(e.code) })
  }
}
