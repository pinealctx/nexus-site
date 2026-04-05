import { describe, it, expect } from "vitest";
import zhCN from "../../messages/zh-CN.json";

function flattenKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      keys.push(...flattenKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

describe("i18n completeness (CP-4)", () => {
  const keys = flattenKeys(zhCN);

  it("zh-CN has at least one key", () => {
    expect(keys.length).toBeGreaterThan(0);
  });

  it.each(keys)("zh-CN key '%s' exists and is non-empty", (key) => {
    const value = getNestedValue(zhCN as Record<string, unknown>, key);
    expect(value).toBeDefined();
    expect(typeof value).toBe("string");
    expect((value as string).length).toBeGreaterThan(0);
  });
});
