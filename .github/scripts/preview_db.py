#!/usr/bin/env python3
"""Provision an ephemeral Supabase branch + git-branch-scoped Vercel env.

Used by .github/workflows/preview-db.yml. Stdlib only.

PRs that touch supabase/migrations get an isolated DB named pr-<n>. Everyone
else keeps the shared production project that Vercel Preview already points at.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from typing import Any

COMMENT_MARK = "<!-- supabase-preview-db -->"
SUPABASE_API = "https://api.supabase.com"
VERCEL_API = "https://api.vercel.com"
POLL_SECONDS = 10
POLL_ATTEMPTS = 60  # ~10 min
HTTP_RETRIES = 5

ENV_KEYS = (
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
)


class ApiError(RuntimeError):
    def __init__(self, status: int, url: str, body: str):
        self.status = status
        self.url = url
        self.body = body
        super().__init__(f"HTTP {status} {url}: {body[:800]}")


def log(msg: str) -> None:
    print(msg, flush=True)


def env(name: str, default: str = "") -> str:
    return os.environ.get(name, default).strip()


def require_env(*names: str) -> dict[str, str]:
    values = {n: env(n) for n in names}
    missing = [n for n, v in values.items() if not v]
    if missing:
        raise SystemExit(f"missing env: {', '.join(missing)}")
    return values


def request(
    method: str,
    url: str,
    *,
    headers: dict[str, str],
    body: Any | None = None,
    query: dict[str, str] | None = None,
) -> Any:
    if query:
        filtered = {k: v for k, v in query.items() if v}
        if filtered:
            url += ("&" if "?" in url else "?") + urllib.parse.urlencode(filtered)
    data = None
    req_headers = dict(headers)
    if body is not None:
        data = json.dumps(body).encode()
        req_headers["Content-Type"] = "application/json"
    last_err: Exception | None = None
    for attempt in range(HTTP_RETRIES):
        req = urllib.request.Request(url, data=data, headers=req_headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                raw = resp.read()
                if not raw:
                    return None
                return json.loads(raw)
        except urllib.error.HTTPError as err:
            raw = err.read().decode("utf-8", "replace")
            if err.code in {429, 500, 502, 503} and attempt < HTTP_RETRIES - 1:
                retry_after = err.headers.get("Retry-After")
                delay = int(retry_after) if retry_after and retry_after.isdigit() else 2**attempt
                log(f"retry {method} {url} after HTTP {err.code} ({delay}s)")
                time.sleep(delay)
                last_err = ApiError(err.code, url, raw)
                continue
            raise ApiError(err.code, url, raw) from err
        except urllib.error.URLError as err:
            if attempt < HTTP_RETRIES - 1:
                time.sleep(2**attempt)
                last_err = err
                continue
            raise
    raise last_err or RuntimeError("request failed")


def supabase(method: str, path: str, body: Any | None = None, query: dict[str, str] | None = None) -> Any:
    token = env("SUPABASE_ACCESS_TOKEN")
    return request(
        method,
        f"{SUPABASE_API}{path}",
        headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
        body=body,
        query=query,
    )


def vercel_query() -> dict[str, str]:
    team = env("VERCEL_TEAM_ID") or env("VERCEL_ORG_ID")
    return {"teamId": team} if team else {}


def vercel(method: str, path: str, body: Any | None = None, extra_query: dict[str, str] | None = None) -> Any:
    token = env("VERCEL_TOKEN")
    query = vercel_query()
    if extra_query:
        query = {**query, **extra_query}
    return request(
        method,
        f"{VERCEL_API}{path}",
        headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
        body=body,
        query=query,
    )


def github(method: str, path: str, body: Any | None = None) -> Any:
    token = env("GITHUB_TOKEN")
    return request(
        method,
        f"https://api.github.com{path}",
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
        body=body,
    )


def pr_number() -> int:
    return int(require_env("PR_NUMBER")["PR_NUMBER"])


def git_branch() -> str:
    return require_env("GIT_BRANCH")["GIT_BRANCH"]


def branch_name() -> str:
    return f"pr-{pr_number()}"


def parent_ref() -> str:
    return require_env("SUPABASE_PROJECT_ID")["SUPABASE_PROJECT_ID"]


def has_migration_diff() -> bool:
    return env("HAS_MIGRATION_DIFF").lower() in {"1", "true", "yes"}


def list_branches() -> list[dict[str, Any]]:
    data = supabase("GET", f"/v1/projects/{parent_ref()}/branches")
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        for key in ("branches", "data"):
            if isinstance(data.get(key), list):
                return data[key]
    return []


def find_branch(branches: list[dict[str, Any]]) -> dict[str, Any] | None:
    name = branch_name()
    head = git_branch()
    number = pr_number()
    for b in branches:
        if b.get("name") == name:
            return b
        if b.get("git_branch") == head:
            return b
        if b.get("pr_number") == number:
            return b
    return None


def create_branch() -> dict[str, Any]:
    log(f"creating supabase branch {branch_name()} (git_branch={git_branch()})")
    return supabase(
        "POST",
        f"/v1/projects/{parent_ref()}/branches",
        {
            "branch_name": branch_name(),
            "git_branch": git_branch(),
            "persistent": False,
            "with_data": False,
        },
    )


def get_branch(branch_id: str) -> dict[str, Any]:
    return supabase("GET", f"/v1/branches/{branch_id}")


def wait_healthy(branch: dict[str, Any]) -> dict[str, Any]:
    branch_id = branch["id"]
    failed = {"INIT_FAILED", "REMOVED", "RESTORE_FAILED", "PAUSE_FAILED"}
    last: dict[str, Any] = branch
    for i in range(POLL_ATTEMPTS):
        try:
            last = get_branch(branch_id)
        except ApiError as err:
            if err.status not in {404, 500}:
                raise
            log(f"branch config not ready ({err.status}), waiting")
            time.sleep(POLL_SECONDS)
            continue
        status = last.get("status") or last.get("preview_project_status")
        listed = find_branch(list_branches()) or {}
        preview_status = listed.get("preview_project_status") or listed.get("status")
        log(f"branch status={status} preview={preview_status} ({i + 1}/{POLL_ATTEMPTS})")
        if status == "ACTIVE_HEALTHY" or preview_status == "ACTIVE_HEALTHY":
            if last.get("db_host"):
                return last
            # Config endpoint sometimes lags credentials; refresh once more.
            time.sleep(5)
            return get_branch(branch_id)
        if status in failed or preview_status in failed:
            raise RuntimeError(f"supabase branch failed: status={status} preview={preview_status}")
        time.sleep(POLL_SECONDS)
    raise TimeoutError(f"timed out waiting for ACTIVE_HEALTHY: {last}")


def db_url(detail: dict[str, Any]) -> str:
    user = urllib.parse.quote(detail.get("db_user") or "postgres", safe="")
    password = urllib.parse.quote(detail.get("db_pass") or "", safe="")
    host = detail["db_host"]
    port = detail.get("db_port") or 5432
    return f"postgresql://{user}:{password}@{host}:{port}/postgres"


def run_supabase(args: list[str]) -> None:
    # Don't log the URL: it embeds the branch DB password.
    cmd = ["supabase", *args]
    display = ["supabase"] + ["***" if a.startswith("postgresql://") else a for a in args]
    log("+ " + " ".join(display))
    subprocess.run(cmd, check=True)


def pick_keys(keys: list[dict[str, Any]]) -> tuple[str, str]:
    anon = ""
    publishable = ""
    for item in keys:
        name = (item.get("name") or "").lower()
        kind = (item.get("type") or "").lower()
        value = item.get("api_key") or item.get("value") or ""
        if not value:
            continue
        if kind == "publishable" or "publishable" in name:
            publishable = value
        elif name == "anon" or (kind in {"legacy", "anon"} and "service" not in name):
            anon = value
    if not anon and not publishable:
        raise RuntimeError(f"no anon/publishable key in api-keys response ({len(keys)} keys)")
    anon = anon or publishable
    publishable = publishable or anon
    return anon, publishable


def api_keys(project_ref: str) -> tuple[str, str]:
    data = supabase("GET", f"/v1/projects/{project_ref}/api-keys", query={"reveal": "true"})
    keys = data if isinstance(data, list) else data.get("api_keys") or data.get("data") or []
    return pick_keys(keys)


def vercel_project() -> str:
    return env("VERCEL_PROJECT_ID") or env("VERCEL_PROJECT_NAME") or "acme-signal"


def vercel_configured() -> bool:
    return bool(env("VERCEL_TOKEN") and vercel_project())


def list_vercel_envs() -> list[dict[str, Any]]:
    data = vercel("GET", f"/v9/projects/{urllib.parse.quote(vercel_project())}/env", extra_query={"limit": "100"})
    if isinstance(data, list):
        return data
    return data.get("envs") or []


def upsert_vercel_env(key: str, value: str, git: str) -> None:
    project = urllib.parse.quote(vercel_project())
    existing = next(
        (
            item
            for item in list_vercel_envs()
            if item.get("key") == key and item.get("gitBranch") == git
        ),
        None,
    )
    payload = {
        "key": key,
        "value": value,
        "type": "plain",
        "target": ["preview"],
        "gitBranch": git,
    }
    if existing:
        log(f"updating Vercel env {key} gitBranch={git}")
        vercel("PATCH", f"/v9/projects/{project}/env/{existing['id']}", payload)
        return
    log(f"creating Vercel env {key} gitBranch={git}")
    vercel("POST", f"/v10/projects/{project}/env", payload, extra_query={"upsert": "true"})


def delete_vercel_env_for_branch(git: str) -> int:
    project = urllib.parse.quote(vercel_project())
    deleted = 0
    for item in list_vercel_envs():
        if item.get("gitBranch") != git:
            continue
        if item.get("key") not in ENV_KEYS:
            continue
        log(f"deleting Vercel env {item.get('key')} gitBranch={git}")
        try:
            vercel("DELETE", f"/v9/projects/{project}/env/{item['id']}")
            deleted += 1
        except ApiError as err:
            if err.status != 404:
                raise
    return deleted


def latest_preview_deployment(git: str) -> dict[str, Any] | None:
    data = vercel(
        "GET",
        "/v6/deployments",
        extra_query={
            "projectId": vercel_project(),
            "limit": "20",
        },
    )
    deployments = data.get("deployments") if isinstance(data, dict) else data
    if not isinstance(deployments, list):
        return None
    matches: list[dict[str, Any]] = []
    for d in deployments:
        if d.get("target") == "production":
            continue
        meta = d.get("meta") or {}
        source = d.get("gitSource") or {}
        ref = meta.get("githubCommitRef") or source.get("ref") or ""
        if ref == git or ref.endswith("/" + git):
            matches.append(d)
    return matches[0] if matches else None


def redeploy_preview(git: str) -> str | None:
    existing = latest_preview_deployment(git)
    project_name = env("VERCEL_PROJECT_NAME") or "acme-signal"
    if existing:
        dep_id = existing.get("uid") or existing.get("id")
        log(f"redeploying Vercel {dep_id} for {git}")
        created = vercel(
            "POST",
            "/v13/deployments",
            {
                "name": existing.get("name") or project_name,
                "deploymentId": dep_id,
                "meta": {"action": "redeploy"},
            },
            extra_query={"forceNew": "1"},
        )
        return created.get("url") if isinstance(created, dict) else None

    head = env("HEAD_SHA")
    repo = env("GITHUB_REPOSITORY")
    org, _, name = repo.partition("/")
    log(f"no existing preview deploy for {git}; creating from git")
    created = vercel(
        "POST",
        "/v13/deployments",
        {
            "name": project_name,
            "project": vercel_project(),
            "gitSource": {
                "type": "github",
                "org": org,
                "repo": name,
                "ref": git,
                **({"sha": head} if head else {}),
            },
        },
        extra_query={"forceNew": "1"},
    )
    return created.get("url") if isinstance(created, dict) else None


def comment(body: str) -> None:
    if not env("GITHUB_TOKEN") or not env("GITHUB_REPOSITORY"):
        log("skip PR comment (no GITHUB_TOKEN/GITHUB_REPOSITORY)")
        return
    repo = env("GITHUB_REPOSITORY")
    number = pr_number()
    text = f"{COMMENT_MARK}\n{body.strip()}\n"
    comments = github("GET", f"/repos/{repo}/issues/{number}/comments?per_page=100")
    if not isinstance(comments, list):
        comments = []
    existing = next((c for c in comments if COMMENT_MARK in (c.get("body") or "")), None)
    if existing:
        github("PATCH", f"/repos/{repo}/issues/comments/{existing['id']}", {"body": text})
        return
    github("POST", f"/repos/{repo}/issues/{number}/comments", {"body": text})


def missing_secrets_comment() -> str:
    return """This PR changes `supabase/migrations/**`, but preview-db could not create a Supabase branch.

Without a branch, the Vercel Preview deploy keeps using the **production** schema and will 500 on new tables/columns.

Enable [branching](https://supabase.com/dashboard/project/_/branches) on the project, then add these repo secrets:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_ID`
- `VERCEL_TOKEN`
- `VERCEL_PROJECT_ID`
- `VERCEL_TEAM_ID` (or `VERCEL_ORG_ID`) if the Vercel project is on a team
"""


def enable_branching_comment() -> str:
    return """Supabase returned 403 creating a preview branch. Branching is probably disabled.

Enable it under Project → **Branching** (Pro). Then re-run **Preview database**.

Do **not** also turn on GitHub Automatic branching while this workflow is active — you'd get two branches per PR.
"""


def success_comment(
    project_ref: str,
    created: bool,
    vercel_url: str | None,
    vercel_ok: bool,
) -> str:
    action = "created and reset (migrations + seed)" if created else "updated (`db push`)"
    vercel_line = (
        f"Vercel Preview env for `{git_branch()}` now points at this branch"
        + (f" and [a redeploy](https://{vercel_url}) was triggered" if vercel_url else " and a redeploy was triggered")
        + " so `NEXT_PUBLIC_*` is inlined at build time."
        if vercel_ok
        else "Vercel env was **not** updated (missing `VERCEL_TOKEN` / `VERCEL_PROJECT_ID`). The preview deploy still talks to production until those secrets exist."
    )
    return f"""Preview DB: Supabase branch [`{branch_name()}`](https://supabase.com/dashboard/project/{project_ref}) (`{project_ref}`) {action}.

{vercel_line}

PRs that don't touch `supabase/migrations/**` keep the shared production database. Nightly reset only hits production.
"""


def teardown_comment() -> str:
    return f"Preview DB: deleted Supabase branch `{branch_name()}` and git-branch Vercel env for `{git_branch()}`."


def ensure() -> int:
    diff = has_migration_diff()
    token = env("SUPABASE_ACCESS_TOKEN")
    project = env("SUPABASE_PROJECT_ID")
    if not token or not project:
        if diff:
            comment(missing_secrets_comment())
            log("missing supabase secrets; commented and skipped")
            return 0
        log("no supabase secrets and no migration diff; skip")
        return 0

    try:
        branches = list_branches()
    except ApiError as err:
        if err.status == 403:
            comment(enable_branching_comment())
            return 1
        raise

    existing = find_branch(branches)
    if not diff and not existing:
        log("no migration diff vs base and no existing branch; preview stays on production DB")
        return 0

    created = False
    if existing is None:
        try:
            existing = create_branch()
            created = True
        except ApiError as err:
            if err.status == 403:
                comment(enable_branching_comment())
                return 1
            if err.status in {409, 422}:
                log(f"create conflict ({err.status}); reusing existing branch if any")
                existing = find_branch(list_branches())
            if existing is None:
                raise

    detail = wait_healthy(existing)
    project_ref = detail.get("ref") or existing.get("project_ref")
    if not project_ref:
        raise RuntimeError(f"branch has no project ref: {detail}")

    if created:
        run_supabase(["db", "reset", "--db-url", db_url(detail), "--yes"])
    else:
        try:
            run_supabase(["db", "push", "--db-url", db_url(detail), "--yes"])
        except subprocess.CalledProcessError:
            log("db push failed; resetting branch from local migrations + seed")
            run_supabase(["db", "reset", "--db-url", db_url(detail), "--yes"])

    anon, publishable = api_keys(project_ref)
    supabase_url = f"https://{project_ref}.supabase.co"
    vercel_ok = False
    vercel_url = None
    if vercel_configured():
        git = git_branch()
        upsert_vercel_env("NEXT_PUBLIC_SUPABASE_URL", supabase_url, git)
        upsert_vercel_env("NEXT_PUBLIC_SUPABASE_ANON_KEY", anon, git)
        upsert_vercel_env("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", publishable, git)
        vercel_url = redeploy_preview(git)
        vercel_ok = True
    else:
        log("VERCEL_TOKEN/VERCEL_PROJECT_ID unset; supabase branch is up but preview env still points at production")

    comment(success_comment(project_ref, created, vercel_url, vercel_ok))
    return 0


def teardown() -> int:
    token = env("SUPABASE_ACCESS_TOKEN")
    project = env("SUPABASE_PROJECT_ID")
    deleted_branch = False
    if token and project:
        try:
            existing = find_branch(list_branches())
        except ApiError as err:
            if err.status in {403, 404}:
                existing = None
            else:
                raise
        if existing:
            log(f"deleting supabase branch {existing.get('name')} ({existing['id']})")
            try:
                supabase("DELETE", f"/v1/branches/{existing['id']}")
                deleted_branch = True
            except ApiError as err:
                if err.status != 404:
                    raise
        else:
            log("no supabase preview branch to delete")
    else:
        log("no supabase secrets; skip branch delete")

    deleted_env = 0
    if vercel_configured():
        deleted_env = delete_vercel_env_for_branch(git_branch())
    else:
        log("no vercel secrets; skip env delete")

    if deleted_branch or deleted_env:
        comment(teardown_comment())
    return 0


def main() -> int:
    if len(sys.argv) != 2 or sys.argv[1] not in {"ensure", "teardown"}:
        print("usage: preview_db.py ensure|teardown", file=sys.stderr)
        return 2
    action = sys.argv[1]
    try:
        return ensure() if action == "ensure" else teardown()
    except ApiError as err:
        log(str(err))
        return 1


if __name__ == "__main__":
    sys.exit(main())
