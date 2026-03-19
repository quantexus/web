import { NextRequest, NextResponse } from "next/server"
import { cancelOrder } from "@/lib/engine/client"
import { grpcToHttp, type GrpcError } from "@/lib/engine/grpc-error"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const body = await request.json()
    const data = await cancelOrder({ orderId: params.orderId, ...body })
    return NextResponse.json(data)
  } catch (err) {
    const e = err as GrpcError
    return NextResponse.json({ error: e.message }, { status: grpcToHttp(e.code) })
  }
}
