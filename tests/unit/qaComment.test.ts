// @vitest-environment node
import { describe, expect, test, vi } from "vitest";
import { publishComment } from "../agent-browser/runner/qa-comment.mjs";

const sha = "a".repeat(40);
const body = "<!-- acme-pr-exploratory-qa -->\nTested: Tasks";
const options = { repo: "QAdottech/acme-signal", pr: 51, sha, body, token: "test-token" };
const response = (value: unknown) => ({ ok: true, json: async () => value });

describe("PR exploratory QA comment", () => {
  test("creates a comment when the PR still targets the tested revision", async () => {
    const request = vi.fn().mockResolvedValueOnce(response({ state: "open", head: { sha } }))
      .mockResolvedValueOnce(response([])).mockResolvedValueOnce(response({ id: 123 }));
    expect(await publishComment(options, request)).toBe("created");
    expect(request.mock.calls[2][0]).toContain("/issues/51/comments");
    expect(request.mock.calls[2][1]).toMatchObject({ method: "POST", body: JSON.stringify({ body }) });
  });

  test("updates only its own bot comment instead of posting duplicates", async () => {
    const request = vi.fn().mockResolvedValueOnce(response({ state: "open", head: { sha } }))
      .mockResolvedValueOnce(response([
        { id: 1, body, user: { login: "someone-else" } },
        { id: 2, body, user: { login: "github-actions[bot]" } },
      ])).mockResolvedValueOnce(response({ id: 2 }));
    expect(await publishComment(options, request)).toBe("updated");
    expect(request.mock.calls[2][0]).toContain("/issues/comments/2");
    expect(request.mock.calls[2][1]).toMatchObject({ method: "PATCH", body: JSON.stringify({ body }) });
  });

  test("never posts stale results or reports without a generated marker", async () => {
    const request = vi.fn().mockResolvedValue(response({ state: "open", head: { sha: "b".repeat(40) } }));
    expect(await publishComment(options, request)).toContain("skipped");
    expect(request).toHaveBeenCalledTimes(1);
    await expect(publishComment({ ...options, body: "untrusted" }, request)).rejects.toThrow("generated report body");
  });

  test("surfaces API failures rather than claiming a report was published", async () => {
    const request = vi.fn().mockResolvedValue({ ok: false, status: 403 });
    await expect(publishComment(options, request)).rejects.toThrow("QA results remain in the run artifacts");
  });
});
