import { describe, expect, it } from "vitest";
import releases from "../../public/latest-releases.json";

describe("latest-releases.json schema (CP-2)", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(releases)).toBe(true);
    expect(releases.length).toBeGreaterThan(0);
  });

  it.each(releases)("entry %# has all required fields with correct types", (entry) => {
    expect(typeof entry.platform).toBe("string");
    expect(entry.platform.length).toBeGreaterThan(0);

    expect(typeof entry.arch).toBe("string");
    expect(entry.arch.length).toBeGreaterThan(0);

    expect(typeof entry.version).toBe("string");
    expect(entry.version).toMatch(/^\d+\.\d+\.\d+/);

    expect(typeof entry.release_date).toBe("string");
    expect(entry.release_date).toMatch(/^\d{4}-\d{2}-\d{2}/);

    expect(typeof entry.download_url).toBe("string");
    expect(() => new URL(entry.download_url)).not.toThrow();

    expect(typeof entry.checksum_sha256).toBe("string");
    expect(typeof entry.size_bytes).toBe("number");
    expect(entry.size_bytes).toBeGreaterThanOrEqual(0);
  });
});
