import { describe, it, expect } from "vitest";
import { parseUserAgent } from "../platform";

describe("parseUserAgent", () => {
  const cases: [string, string, string][] = [
    // [UA string, expected platform, expected arch]
    [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      "macos",
      "universal",
    ],
    [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "windows",
      "x86_64",
    ],
    [
      "Mozilla/5.0 (Windows NT 10.0; ARM64) AppleWebKit/537.36",
      "windows",
      "arm64",
    ],
    [
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
      "linux",
      "x86_64",
    ],
    [
      "Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36",
      "linux",
      "arm64",
    ],
    [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      "ios",
      "arm64",
    ],
    [
      "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      "ios",
      "arm64",
    ],
    [
      "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36",
      "android",
      "x86_64",
    ],
    [
      "Mozilla/5.0 (Linux; Android 14; arm64) AppleWebKit/537.36",
      "android",
      "arm64",
    ],
    ["", "unknown", "unknown"],
  ];

  it.each(cases)("detects %s as %s/%s", (ua, platform, arch) => {
    const result = parseUserAgent(ua);
    expect(result.platform).toBe(platform);
    expect(result.arch).toBe(arch);
  });
});
