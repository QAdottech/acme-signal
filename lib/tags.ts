/** Deal tags offered in the app, with one soft colour each. */
export const DEAL_TAGS = [
  "Pre POC",
  "POC",
  "POC Complete",
  "Enterprise",
  "Startup",
  "Expansion",
  "Renewal",
  "At Risk",
  "Champion Identified",
  "Technical Eval",
] as const;

const TAG_STYLES: Record<string, string> = {
  "Pre POC": "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  POC: "bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
  "POC Complete": "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  Enterprise: "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  Startup: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
  Expansion: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  Renewal: "bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300",
  "At Risk": "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  "Champion Identified": "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  "Technical Eval": "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
};

export function tagStyle(tag: string): string {
  return TAG_STYLES[tag] ?? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
}
