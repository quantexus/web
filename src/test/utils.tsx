import React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, type RenderOptions } from "@testing-library/react"
import { useTradingStore } from "@/stores/trading.store"
import { useSessionStore } from "@/stores/session.store"
import { useStreamStore } from "@/stores/stream.store"

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

interface WrapperProps {
  children: React.ReactNode
}

export function createWrapper(queryClient?: QueryClient) {
  const client = queryClient ?? createTestQueryClient()
  function Wrapper({ children }: WrapperProps) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
  return Wrapper
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderOptions & { queryClient?: QueryClient }
) {
  const { queryClient, ...renderOptions } = options ?? {}
  const client = queryClient ?? createTestQueryClient()
  function Wrapper({ children }: WrapperProps) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

export function resetAllStores() {
  useTradingStore.setState({
    symbol: "",
    baseAsset: "",
    quoteAsset: "",
    side: "buy",
    orderType: "limit",
  })
  useSessionStore.setState({ userId: "" })
  useStreamStore.setState({
    orderbookStatus: "connecting",
    tradesStatus: "connecting",
  })
}
