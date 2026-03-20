import { type NextRequest } from "next/server"
import { getNatsClient } from "@/lib/nats/client"

export const dynamic = "force-dynamic"

interface RawTradeEvent {
  trade_id: string
  price: string
  quantity: string
  side: string
  timestamp: number
}

export async function GET(
  req: NextRequest,
  { params }: { params: { symbol: string } }
) {
  const { symbol } = params
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let nc
      try {
        nc = await getNatsClient()
      } catch {
        controller.close()
        return
      }

      const sub = nc.subscribe(`quantexus.${symbol}.trade`)

      req.signal.addEventListener("abort", () => {
        sub.unsubscribe()
        controller.close()
      })

      try {
        for await (const msg of sub) {
          const raw = JSON.parse(new TextDecoder().decode(msg.data)) as RawTradeEvent
          const trade = {
            tradeId: raw.trade_id,
            price: raw.price,
            quantity: raw.quantity,
            side: raw.side,
            timestampNs: raw.timestamp.toString(),
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(trade)}\n\n`))
        }
      } catch {
        // subscription closed on disconnect
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
