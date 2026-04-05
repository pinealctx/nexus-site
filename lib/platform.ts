export interface PlatformInfo {
  platform: "macos" | "windows" | "linux" | "ios" | "android" | "unknown";
  arch: "arm64" | "x86_64" | "universal" | "unknown";
}

interface NavigatorUAData {
  platform: string;
  getHighEntropyValues(hints: string[]): Promise<{ architecture?: string; platform?: string }>;
}

export async function detectPlatform(): Promise<PlatformInfo> {
  // Try Client Hints API first (modern Chromium browsers)
  if (typeof navigator !== "undefined" && "userAgentData" in navigator) {
    try {
      const uaData = navigator.userAgentData as NavigatorUAData;
      const hints = await uaData.getHighEntropyValues(["architecture", "platform"]);
      const platform = normalizePlatform(hints.platform || uaData.platform);
      const arch = normalizeArch(hints.architecture || "");
      if (platform !== "unknown") return { platform, arch };
    } catch {
      // Fall through to UA string parsing
    }
  }

  // Fallback: parse User-Agent string
  if (typeof navigator !== "undefined") {
    return parseUserAgent(navigator.userAgent);
  }

  return { platform: "unknown", arch: "unknown" };
}

export function parseUserAgent(ua: string): PlatformInfo {
  const lower = ua.toLowerCase();

  // Mobile first
  if (/iphone|ipad|ipod/.test(lower)) {
    return { platform: "ios", arch: "arm64" };
  }
  if (/android/.test(lower)) {
    const arch = /arm64|aarch64/.test(lower) ? "arm64" : "x86_64";
    return { platform: "android", arch };
  }

  // Desktop
  if (/macintosh|mac os x/.test(lower)) {
    // Apple Silicon detection via UA is unreliable; default to universal
    return { platform: "macos", arch: "universal" };
  }
  if (/windows/.test(lower)) {
    const arch = /arm64|aarch64/.test(lower) ? "arm64" : "x86_64";
    return { platform: "windows", arch };
  }
  if (/linux/.test(lower)) {
    const arch = /arm64|aarch64/.test(lower) ? "arm64" : "x86_64";
    return { platform: "linux", arch };
  }

  return { platform: "unknown", arch: "unknown" };
}

function normalizePlatform(raw: string): PlatformInfo["platform"] {
  const lower = raw.toLowerCase();
  if (lower.includes("mac")) return "macos";
  if (lower.includes("win")) return "windows";
  if (lower.includes("linux")) return "linux";
  if (lower.includes("android")) return "android";
  if (lower.includes("ios") || lower.includes("iphone")) return "ios";
  return "unknown";
}

function normalizeArch(raw: string): PlatformInfo["arch"] {
  const lower = raw.toLowerCase();
  if (lower.includes("arm") || lower.includes("aarch64")) return "arm64";
  if (lower.includes("x86") || lower.includes("x64")) return "x86_64";
  return "unknown";
}
