// Runtime accounting is separate from judging whether the agent found a bug.
const nonnegative = value => Number.isSafeInteger(value) && value >= 0 ? value : null;
const dollars = value => typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;

export function usageFromEvents(text, agent) {
  let completed = false;
  let usage = null;
  let costUsd = null;
  try {
    for (const line of text.split("\n")) {
      if (!line.trim()) continue;
      const event = JSON.parse(line);
      if (!event || typeof event !== "object") throw new Error("Invalid event");
      if (agent === "claude" && event.type === "result") {
        completed = event.subtype === "success" && event.is_error === false;
        usage = event.usage ?? null;
        costUsd = dollars(event.total_cost_usd);
      }
      if (agent === "codex" && ["turn.completed", "turn.failed"].includes(event.type)) {
        completed = event.type === "turn.completed";
        usage = event.usage ?? usage;
      }
    }
  } catch {
    return { completed: false, tokens: null, costUsd: null, source: "malformed-runtime-log" };
  }
  if (!usage || typeof usage !== "object" || Array.isArray(usage)) return { completed, tokens: null, costUsd, source: agent === "claude" ? "claude-cli" : "unknown" };
  const input = nonnegative(usage.input_tokens);
  const output = nonnegative(usage.output_tokens);
  const cached = nonnegative(agent === "claude" ? usage.cache_read_input_tokens : usage.cached_input_tokens);
  const created = agent === "claude" ? nonnegative(usage.cache_creation_input_tokens) : null;
  // Claude reports cache reads/creation separately from input_tokens. Codex
  // cached_input_tokens are already included in input_tokens.
  const total = input === null || output === null ? null :
    agent === "claude" ? (cached === null || created === null ? null : input + cached + created + output) : input + output;
  return {
    completed, tokens: { input, cachedInput: cached, cacheCreationInput: created, output, total },
    costUsd, source: agent === "claude" && costUsd !== null ? "claude-cli-reported" : "unknown",
  };
}

export function codexEstimate(tokens, rates, model) {
  if (!rates || rates.model !== model || !/^\d{4}-\d{2}-\d{2}$/.test(rates.effectiveDate)) return null;
  const { input, cachedInput, output } = tokens ?? {};
  if ([input, cachedInput, output].some(value => value === null || value === undefined)) return null;
  if (![rates.inputUsdPerMillion, rates.cachedInputUsdPerMillion, rates.outputUsdPerMillion].every(value => dollars(value) !== null)) return null;
  if (cachedInput > input) return null;
  return ((input - cachedInput) * rates.inputUsdPerMillion + cachedInput * rates.cachedInputUsdPerMillion + output * rates.outputUsdPerMillion) / 1_000_000;
}
