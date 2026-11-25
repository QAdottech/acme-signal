import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const VALUE_SUFFIXES: Record<string, number> = { k: 1_000, m: 1_000_000 }

/**
 * Parses a deal value typed by a person: "40000", "40,000", "$40k" or "1.5m".
 */
export function parseDealValue(raw: string): number {
  const cleaned = raw.trim().toLowerCase().replace(/[$,\s]/g, '')
  const multiplier = VALUE_SUFFIXES[cleaned.slice(-1)]
  return multiplier ? Number(cleaned.slice(0, -1)) * multiplier : Number(cleaned)
}
