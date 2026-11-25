import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const VALUE_SUFFIXES: Record<string, number> = { k: 1_000, m: 1_000_000 }

/**
 * Parses a deal value typed by a person: "40000", "40,000", "$40k" or "1.5m".
 * Returns NaN when the input isn't a valid amount.
 */
export function parseDealValue(raw: string): number {
  const cleaned = raw.trim().toLowerCase().replace(/[$,\s]/g, '')
  const suffix = cleaned.slice(-1)
  const multiplier = VALUE_SUFFIXES[suffix]
  const amount = multiplier ? cleaned.slice(0, -1) : cleaned
  // Number("") is 0, so reject empty input explicitly; "40kk" leaves "40k", which is NaN.
  if (!/^\d+(\.\d+)?$/.test(amount)) return NaN
  return Number(amount) * (multiplier ?? 1)
}
