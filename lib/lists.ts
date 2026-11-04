const LIST_SWATCHES = [
  "bg-sky-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-indigo-500",
];

/** Stable colour per list, so a list keeps its swatch everywhere it appears. */
export function listSwatch(id: string): string {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return LIST_SWATCHES[hash % LIST_SWATCHES.length];
}
