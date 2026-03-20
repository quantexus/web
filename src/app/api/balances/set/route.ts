import { NextResponse } from "next/server"
import { setBalance } from "@/lib/engine/client"
import { grpcToHttp, type GrpcError } from "@/lib/engine/grpc-error"
import type { SetBalanceRequest } from "@/lib/engine/types"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SetBalanceRequest
    const data = await setBalance(body)
    return NextResponse.json(data)
  } catch (err) {
    const e = err as GrpcError
    return NextResponse.json({ error: e.message }, { status: grpcToHttp(e.code) })
  }
}
