import { describe, expect, it } from "vitest";
import { parseDealValue } from "@/lib/utils";

describe("parseDealValue", () => {
  it("keeps plain numbers exactly", () => {
    expect(parseDealValue("12345")).toBe(12345);
    expect(parseDealValue("75000")).toBe(75000);
    expect(parseDealValue("99.5")).toBe(99.5);
  });

  it("accepts separators and a dollar sign", () => {
    expect(parseDealValue("12,000")).toBe(12000);
    expect(parseDealValue("$ 40,000")).toBe(40000);
  });

  it("expands k and m shorthand, any case", () => {
    expect(parseDealValue("40k")).toBe(40000);
    expect(parseDealValue("2.5K")).toBe(2500);
    expect(parseDealValue("1.5m")).toBe(1500000);
  });

  it("rejects input that isn't an amount", () => {
    expect(parseDealValue("40kk")).toBeNaN();
    expect(parseDealValue("abc")).toBeNaN();
    expect(parseDealValue("")).toBeNaN();
    expect(parseDealValue("k")).toBeNaN();
  });
});
