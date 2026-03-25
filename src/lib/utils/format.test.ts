import { describe, it, expect } from "vitest"
import { fromFixed, toFixed, PRECISION } from "./format"

describe("PRECISION", () => {
  it("is 18n", () => {
    expect(PRECISION).toBe(18n)
  })
})

describe("fromFixed", () => {
  it("converts 1e18 to 1.000000", () => {
    expect(fromFixed("1000000000000000000")).toBe("1.000000")
  })

  it("converts 0 to 0.000000", () => {
    expect(fromFixed("0")).toBe("0.000000")
  })

  it("converts 1.5e18 to 1.500000", () => {
    expect(fromFixed("1500000000000000000")).toBe("1.500000")
  })

  it("uses custom displayDecimals", () => {
    expect(fromFixed("1000000000000000000", 2)).toBe("1.00")
  })

  it("converts fractional-only value", () => {
    expect(fromFixed("500000000000000000")).toBe("0.500000")
  })

  it("handles large integer part", () => {
    expect(fromFixed("100000000000000000000")).toBe("100.000000")
  })

  it("pads fractional part with leading zeros", () => {
    expect(fromFixed("1000000000000000")).toBe("0.001000")
  })
})

describe("toFixed", () => {
  it("converts '1.0' to 1e18", () => {
    expect(toFixed("1.0")).toBe("1000000000000000000")
  })

  it("converts '1.5' to 1.5e18", () => {
    expect(toFixed("1.5")).toBe("1500000000000000000")
  })

  it("converts '0' (no decimal) to 0", () => {
    expect(toFixed("0")).toBe("0")
  })

  it("converts integer string without decimal", () => {
    expect(toFixed("1")).toBe("1000000000000000000")
  })

  it("pads fractional part when shorter than 18 digits", () => {
    expect(toFixed("0.5")).toBe("500000000000000000")
  })

  it("truncates fractional part longer than 18 digits", () => {
    expect(toFixed("1.1234567890123456789")).toBe("1123456789012345678")
  })

  it("handles empty fractional part (just decimal point)", () => {
    expect(toFixed("1.")).toBe("1000000000000000000")
  })

  it("converts '100' correctly", () => {
    expect(toFixed("100")).toBe("100000000000000000000")
  })

  it("round-trips through fromFixed", () => {
    const original = "1500000000000000000"
    expect(toFixed(fromFixed(original))).toBe(original)
  })
})
