export const PRECISION = 18n

/**
 * Convert an 18-decimal fixed-point integer string to a human-readable decimal string.
 * e.g. "1000000000000000000" → "1.000000"
 *
 * Never uses parseFloat or Number() — BigInt only.
 */
export function fromFixed(raw: string, displayDecimals = 6): string {
  const value = BigInt(raw)
  const divisor = 10n ** PRECISION
  const intPart = value / divisor
  const fracPart = value % divisor
  const fracStr = fracPart.toString().padStart(Number(PRECISION), "0").slice(0, displayDecimals)
  return `${intPart}.${fracStr}`
}

/**
 * Convert a human-readable decimal string to an 18-decimal fixed-point integer string.
 * e.g. "1.5" → "1500000000000000000"
 *
 * Never uses parseFloat or Number() — BigInt only.
 */
export function toFixed(human: string): string {
  const [intStr = "0", fracStr = ""] = human.split(".")
  const paddedFrac = fracStr.padEnd(Number(PRECISION), "0").slice(0, Number(PRECISION))
  const result = BigInt(intStr) * 10n ** PRECISION + BigInt(paddedFrac)
  return result.toString()
}
