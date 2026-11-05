import { describe, expect, it } from "vitest";
import { safeReturnPath } from "@/lib/safe-path";

const origin = "https://acme.example";

describe("safeReturnPath", () => {
  it.each([
    ["/deals", "/deals"],
    ["/deals?resetDemo=1&demoBugs=all", "/deals?resetDemo=1&demoBugs=all"],
    ["/organizations/12#notes", "/organizations/12#notes"],
    ["/a/../people", "/people"],
  ])("keeps same-site path %s", (from, expected) => {
    expect(safeReturnPath(from, origin)).toBe(expected);
  });

  it.each([
    null,
    "",
    "deals",
    "//example.org",
    "/\\example.org",
    "\\\\example.org",
    "/\\/example.org",
    "/\t/example.org",
    "/\n/example.org",
    "https://example.org/phish",
    "javascript:alert(1)",
    "/%5Cexample.org/..",
  ])("rejects %j", (from) => {
    const result = safeReturnPath(from, origin);
    expect(new URL(result, origin).origin).toBe(origin);
    if (from !== "/%5Cexample.org/..") expect(result).toBe("/");
  });
});
