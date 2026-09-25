import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { z } from "zod";

const marker = "<!-- acme-pr-exploratory-qa -->";
const repoSchema = z.string().regex(/^[\w.-]+\/[\w.-]+$/);
const shaSchema = z.string().regex(/^[0-9a-f]{40}$/);

export async function publishComment({ repo, pr, sha, body, token }, request = fetch) {
  repoSchema.parse(repo);
  z.number().int().positive().parse(pr);
  shaSchema.parse(sha);
  if (!token || !body.startsWith(marker)) throw new Error("QA comment needs a GitHub token and generated report body.");
  const base = `https://api.github.com/repos/${repo}`;
  const api = async (path, method = "GET", payload) => {
    const response = await request(`${base}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "acme-pr-qa-comment" },
      ...(payload === undefined ? {} : { body: JSON.stringify(payload) }),
    });
    if (!response.ok) throw new Error(`GitHub ${method} ${path} failed (${response.status}); QA results remain in the run artifacts. Check workflow PR comment permissions.`);
    return response.json();
  };
  // Do not replace a newer PR revision's report with stale deployment results.
  const pull = z.object({ state: z.string(), head: z.object({ sha: shaSchema }) }).parse(await api(`/pulls/${pr}`));
  if (pull.state !== "open" || pull.head.sha !== sha) return "skipped: PR closed or head changed";

  for (let page = 1; page <= 20; page++) {
    const comments = z.array(z.object({ id: z.number(), body: z.string().nullable(), user: z.object({ login: z.string() }) }))
      .parse(await api(`/issues/${pr}/comments?per_page=100&page=${page}`));
    const previous = comments.find(comment => comment.user.login === "github-actions[bot]" && comment.body?.startsWith(marker));
    if (previous) {
      await api(`/issues/comments/${previous.id}`, "PATCH", { body });
      return "updated";
    }
    if (comments.length < 100) {
      await api(`/issues/${pr}/comments`, "POST", { body });
      return "created";
    }
  }
  throw new Error("QA comment not found within 2000 PR comments; refusing to create a duplicate. Review the PR manually.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [repo, rawPr, sha, file] = process.argv.slice(2);
  publishComment({ repo, pr: Number(rawPr), sha, body: readFileSync(file, "utf8"), token: process.env.GITHUB_TOKEN })
    .then(result => console.log(`PR exploratory QA comment: ${result}.`))
    .catch(error => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
}
