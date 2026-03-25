import { describe, it, expect } from "vitest"
import { cn } from "./cn"

describe("cn", () => {
  it("returns a single class unchanged", () => {
    expect(cn("foo")).toBe("foo")
  })

  it("merges multiple classes", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("resolves tailwind conflicts (later class wins)", () => {
    expect(cn("text-red-400", "text-green-400")).toBe("text-green-400")
  })

  it("handles conditional classes with falsy values", () => {
    expect(cn("base", false && "ignored", undefined, null, "active")).toBe("base active")
  })

  it("handles object syntax", () => {
    expect(cn({ active: true, inactive: false })).toBe("active")
  })

  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("")
  })

  it("deduplicates tailwind utilities", () => {
    expect(cn("p-4", "p-2")).toBe("p-2")
  })
})
