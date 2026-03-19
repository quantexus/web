import { NextRequest, NextResponse } from "next/server"
import { getOrderBook } from "@/lib/engine/client"
import { grpcToHttp, type GrpcError } from "@/lib/engine/grpc-error"

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  const depth = Number(request.nextUrl.searchParams.get("depth") ?? "15")
  try {
    const data = await getOrderBook(params.symbol, depth)
    return NextResponse.json(data)
  } catch (err) {
    const e = err as GrpcError
    return NextResponse.json({ error: e.message }, { status: grpcToHttp(e.code) })
  }
}
