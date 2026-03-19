import { redirect } from "next/navigation"

export default function HomePage() {
  const symbol = process.env.ENGINE_SYMBOL ?? "UNKNOWN"
  redirect(`/trade/${symbol}`)
}
