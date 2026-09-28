import { describe, expect, it } from "vitest";
import { getOrganizationMapUrls } from "@/lib/organizationMap";

describe("organization map URLs", () => {
  it("builds an encoded Maps search link without a key", () => {
    const urls = getOrganizationMapUrls("  New York, USA  ");

    expect(urls?.searchUrl).toBe(
      "https://www.google.com/maps/search/?api=1&query=New+York%2C+USA"
    );
    expect(urls?.embedUrl).toBeUndefined();
  });

  it("builds an official Maps Embed URL when configured", () => {
    const urls = getOrganizationMapUrls("Stockholm, Sweden", "test key&1");

    expect(urls?.embedUrl).toBe(
      "https://www.google.com/maps/embed/v1/place?key=test+key%261&q=Stockholm%2C+Sweden"
    );
  });

  it("does not build a map for a missing location", () => {
    expect(getOrganizationMapUrls("  ", "test-key")).toBeNull();
  });
});
