/**
 * Server-side only — never import this file from client components or hooks.
 * Provides a singleton NATS connection reused across SSE route handlers.
 */
import { connect, type NatsConnection } from "nats"

let _nc: NatsConnection | null = null

export async function getNatsClient(): Promise<NatsConnection> {
  if (_nc && !_nc.isClosed()) return _nc
  _nc = await connect({ servers: process.env.NATS_URL ?? "nats://localhost:4222" })
  return _nc
}
