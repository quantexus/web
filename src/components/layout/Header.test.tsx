import { describe, it, expect, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { Header } from "./Header"
import { useTradingStore } from "@/stores/trading.store"
import { useSessionStore } from "@/stores/session.store"
import { useStreamStore } from "@/stores/stream.store"

describe("Header", () => {
  beforeEach(() => {
    useTradingStore.setState({ symbol: "", baseAsset: "", quoteAsset: "", side: "buy", orderType: "limit" })
    useSessionStore.setState({ userId: "" })
    useStreamStore.setState({ orderbookStatus: "connecting", tradesStatus: "connecting" })
  })

  it("renders Quantexus brand name", () => {
    render(<Header />)
    expect(screen.getByText("Quantexus")).toBeInTheDocument()
  })

  it("shows 'Set user ID' when no userId", () => {
    render(<Header />)
    expect(screen.getByText("Set user ID")).toBeInTheDocument()
  })

  it("shows truncated userId when set", () => {
    useSessionStore.setState({ userId: "abcdefghijklmnop" })
    render(<Header />)
    expect(screen.getByText("abcdefgh…")).toBeInTheDocument()
  })

  it("shows symbol badge when symbol is set", () => {
    useTradingStore.setState({ symbol: "BTCUSD", baseAsset: "BTC", quoteAsset: "USD", side: "buy", orderType: "limit" })
    render(<Header />)
    expect(screen.getByText("BTCUSD")).toBeInTheDocument()
  })

  it("does not show symbol badge when symbol is empty", () => {
    render(<Header />)
    expect(screen.queryByText("BTCUSD")).not.toBeInTheDocument()
  })

  it("shows Disconnected status when both streams are disconnected", () => {
    useStreamStore.setState({ orderbookStatus: "disconnected", tradesStatus: "disconnected" })
    render(<Header />)
    expect(screen.getByText("Disconnected")).toBeInTheDocument()
  })

  it("shows Live status when both streams are connected", () => {
    useStreamStore.setState({ orderbookStatus: "connected", tradesStatus: "connected" })
    render(<Header />)
    expect(screen.getByText("Live")).toBeInTheDocument()
  })

  it("shows Partial status when only one stream is connected", () => {
    useStreamStore.setState({ orderbookStatus: "connected", tradesStatus: "disconnected" })
    render(<Header />)
    expect(screen.getByText("Partial")).toBeInTheDocument()
  })

  it("shows Partial status when other stream is connected", () => {
    useStreamStore.setState({ orderbookStatus: "disconnected", tradesStatus: "connected" })
    render(<Header />)
    expect(screen.getByText("Partial")).toBeInTheDocument()
  })

  it("shows Disconnected status when both streams are connecting", () => {
    render(<Header />)
    expect(screen.getByText("Disconnected")).toBeInTheDocument()
  })

  it("enters editing mode when user pill is clicked", () => {
    render(<Header />)
    fireEvent.click(screen.getByText("Set user ID"))
    expect(screen.getByPlaceholderText("User UUID")).toBeInTheDocument()
  })

  it("sets userId and exits editing on form submit", () => {
    render(<Header />)
    fireEvent.click(screen.getByText("Set user ID"))
    const input = screen.getByPlaceholderText("User UUID")
    fireEvent.change(input, { target: { value: "new-user-id" } })
    fireEvent.submit(input.closest("form")!)
    expect(useSessionStore.getState().userId).toBe("new-user-id")
    expect(screen.queryByPlaceholderText("User UUID")).not.toBeInTheDocument()
  })

  it("trims whitespace from userId on submit", () => {
    render(<Header />)
    fireEvent.click(screen.getByText("Set user ID"))
    const input = screen.getByPlaceholderText("User UUID")
    fireEvent.change(input, { target: { value: "  spaced-id  " } })
    fireEvent.submit(input.closest("form")!)
    expect(useSessionStore.getState().userId).toBe("spaced-id")
  })

  it("exits editing mode on blur", () => {
    render(<Header />)
    fireEvent.click(screen.getByText("Set user ID"))
    const input = screen.getByPlaceholderText("User UUID")
    fireEvent.blur(input)
    expect(screen.queryByPlaceholderText("User UUID")).not.toBeInTheDocument()
  })

  it("pre-fills input with current userId when editing starts", () => {
    useSessionStore.setState({ userId: "existing-user" })
    render(<Header />)
    fireEvent.click(screen.getByText("existing…"))
    const input = screen.getByPlaceholderText("User UUID") as HTMLInputElement
    expect(input.value).toBe("existing-user")
  })
})
