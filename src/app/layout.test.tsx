import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"

vi.mock("next/font/google", () => ({
  Inter: vi.fn(() => ({ className: "mock-inter-font" })),
}))

vi.mock("./globals.css", () => ({}))

vi.mock("./providers", () => ({
  Providers: ({ children }: { children: React.ReactNode }) => <div data-testid="providers">{children}</div>,
}))

import RootLayout, { metadata } from "./layout"

describe("RootLayout", () => {
  it("renders children inside providers", () => {
    render(
      <RootLayout>
        <div data-testid="child">content</div>
      </RootLayout>
    )
    expect(screen.getByTestId("child")).toBeInTheDocument()
    expect(screen.getByTestId("providers")).toBeInTheDocument()
  })

  it("exports correct metadata", () => {
    expect(metadata.title).toBe("Quantexus Terminal")
    expect(metadata.description).toBe("Exchange trading terminal")
  })
})
