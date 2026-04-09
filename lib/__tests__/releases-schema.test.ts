import { describe, expect, it } from "vitest";
import cli from "../../public/releases/cli.json";
import desktop from "../../public/releases/desktop.json";

function validateRelease(release: typeof desktop, name: string) {
  describe(`${name} release schema`, () => {
    it("has version and release_date fields", () => {
      expect(typeof release.version).toBe("string");
      expect(typeof release.release_date).toBe("string");
    });

    it("has an assets array", () => {
      expect(Array.isArray(release.assets)).toBe(true);
    });

    it.each(release.assets)("asset %# has required fields", (asset) => {
      expect(typeof asset.platform).toBe("string");
      expect(asset.platform.length).toBeGreaterThan(0);
      expect(typeof asset.arch).toBe("string");
      expect(asset.arch.length).toBeGreaterThan(0);
      expect(typeof asset.available).toBe("boolean");
      expect(typeof asset.download_url).toBe("string");
      expect(typeof asset.checksum_sha256).toBe("string");
      expect(typeof asset.size_bytes).toBe("number");
    });
  });
}

validateRelease(desktop, "desktop");
validateRelease(cli, "cli");
