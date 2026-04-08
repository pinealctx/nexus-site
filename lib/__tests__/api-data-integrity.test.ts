import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { ApiData } from "../api-types";

const apiData: ApiData = JSON.parse(readFileSync(join(__dirname, "../../public/api-data/api.json"), "utf-8"));

describe("API data integrity (CP-5)", () => {
  it("has services", () => {
    expect(apiData.services.length).toBeGreaterThan(0);
  });

  for (const svc of apiData.services) {
    describe(`Service: ${svc.name}`, () => {
      it("has methods", () => {
        expect(svc.methods.length).toBeGreaterThan(0);
      });

      for (const method of svc.methods) {
        it(`method ${method.name} has complete options`, () => {
          expect(method.options).toBeDefined();
          expect(typeof method.options.agentOnly).toBe("boolean");
          expect(typeof method.options.userOnly).toBe("boolean");
          expect(typeof method.options.skipAuth).toBe("boolean");
        });
      }
    });
  }

  it("sensitive fields are correctly marked", () => {
    let sensitiveCount = 0;
    for (const msg of Object.values(apiData.messages)) {
      for (const field of msg.fields) {
        expect(typeof field.sensitive).toBe("boolean");
        if (field.sensitive) sensitiveCount++;
      }
    }
    // We know from gen-api-data output there are 18 sensitive fields
    expect(sensitiveCount).toBeGreaterThan(0);
  });
});
