import { NextResponse } from "next/server"
import { getBalances } from "@/lib/engine/client"
import { grpcToHttp, type GrpcError } from "@/lib/engine/grpc-error"

export async function GET(
  _request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const data = await getBalances(params.userId)
    return NextResponse.json(data)
  } catch (err) {
    const e = err as GrpcError
    return NextResponse.json({ error: e.message }, { status: grpcToHttp(e.code) })
  }
}
