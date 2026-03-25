import { describe, it, expect, vi, beforeEach } from "vitest"

const mockConnect = vi.fn()

vi.mock("nats", () => ({
  connect: mockConnect,
}))

describe("getNatsClient", () => {
  beforeEach(() => {
    vi.resetModules()
    mockConnect.mockReset()
  })

  async function loadNatsClient() {
    return await import("./client")
  }

  it("creates a new connection on first call", async () => {
    const mockNc = { isClosed: vi.fn(() => false) }
    mockConnect.mockResolvedValue(mockNc)

    const { getNatsClient } = await loadNatsClient()
    const nc = await getNatsClient()
    expect(nc).toBe(mockNc)
    expect(mockConnect).toHaveBeenCalledOnce()
  })

  it("returns existing connection if not closed", async () => {
    const mockNc = { isClosed: vi.fn(() => false) }
    mockConnect.mockResolvedValue(mockNc)

    const { getNatsClient } = await loadNatsClient()
    const nc1 = await getNatsClient()
    const nc2 = await getNatsClient()
    expect(nc1).toBe(nc2)
    expect(mockConnect).toHaveBeenCalledOnce()
  })

  it("reconnects when existing connection is closed", async () => {
    const closedNc = { isClosed: vi.fn(() => true) }
    const freshNc = { isClosed: vi.fn(() => false) }
    mockConnect
      .mockResolvedValueOnce(closedNc)
      .mockResolvedValueOnce(freshNc)

    const { getNatsClient } = await loadNatsClient()
    await getNatsClient()
    const nc2 = await getNatsClient()
    expect(mockConnect).toHaveBeenCalledTimes(2)
    expect(nc2).toBe(freshNc)
  })

  it("uses NATS_URL env variable when set", async () => {
    const originalEnv = process.env.NATS_URL
    process.env.NATS_URL = "nats://custom:4222"

    const mockNc = { isClosed: vi.fn(() => false) }
    mockConnect.mockResolvedValue(mockNc)

    const { getNatsClient } = await loadNatsClient()
    await getNatsClient()
    expect(mockConnect).toHaveBeenCalledWith({ servers: "nats://custom:4222" })

    process.env.NATS_URL = originalEnv
  })

  it("uses default URL when NATS_URL is not set", async () => {
    const originalEnv = process.env.NATS_URL
    delete process.env.NATS_URL

    const mockNc = { isClosed: vi.fn(() => false) }
    mockConnect.mockResolvedValue(mockNc)

    const { getNatsClient } = await loadNatsClient()
    await getNatsClient()
    expect(mockConnect).toHaveBeenCalledWith({ servers: "nats://localhost:4222" })

    process.env.NATS_URL = originalEnv
  })
})
