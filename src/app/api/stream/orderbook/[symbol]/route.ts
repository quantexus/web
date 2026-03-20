import { type NextRequest } from "next/server"
import { getOrderBook } from "@/lib/engine/client"

export const dynamic = "force-dynamic"

export async function GET(
  req: NextRequest,
  { params }: { params: { symbol: string } }
) {
  const depth = Number(req.nextUrl.searchParams.get("depth") ?? "15")
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      const interval = setInterval(async () => {
        try {
          const data = await getOrderBook(params.symbol, depth)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {
          // engine unreachable — skip tick, client sees no update
        }
      }, 200)

      req.signal.addEventListener("abort", () => {
        clearInterval(interval)
        controller.close()
      })
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
