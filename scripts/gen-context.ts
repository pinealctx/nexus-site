/**
 * gen-context.ts
 *
 * Generates public/nexus-context.json from api.json and docs content.
 * This file is consumed by AI assistants for quick context ingestion.
 *
 * Usage: pnpm tsx scripts/gen-context.ts
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

interface ApiData {
  services: {
    name: string;
    fullName: string;
    methods: {
      name: string;
      description: string;
      httpPath: string;
      options: { agentOnly: boolean; userOnly: boolean; skipAuth: boolean };
      inputType: string;
      outputType: string;
    }[];
  }[];
}

interface ContextOutput {
  version: string;
  generatedAt: string;
  api: {
    baseUrl: string;
    services: {
      name: string;
      methods: {
        name: string;
        path: string;
        description: string;
        auth: string;
        requestType: string;
        responseType: string;
      }[];
    }[];
  };
  docsIndex: { title: string; path: string }[];
}

const ROOT = join(__dirname, "..");
const apiDataPath = join(ROOT, "public", "api-data", "api.json");
const docsDir = join(ROOT, "content", "docs", "zh-CN");
const outputPath = join(ROOT, "public", "nexus-context.json");

// Load API data
const apiData: ApiData = JSON.parse(readFileSync(apiDataPath, "utf-8"));

// Build API summary
const apiSummary = {
  baseUrl: "https://nexus-dev.xsyphon.com",
  services: apiData.services.map((svc) => ({
    name: svc.name,
    methods: svc.methods.map((m) => {
      let auth = "access_token";
      if (m.options.skipAuth) auth = "none";
      else if (m.options.agentOnly) auth = "agent_token";
      else if (m.options.userOnly) auth = "user_token";

      return {
        name: m.name,
        path: m.httpPath,
        description: m.description.split("\n")[0].trim(),
        auth,
        requestType: m.inputType.split(".").pop() || m.inputType,
        responseType: m.outputType.split(".").pop() || m.outputType,
      };
    }),
  })),
};

// Scan docs directory for MDX files
function scanDocs(dir: string): { title: string; path: string }[] {
  const results: { title: string; path: string }[] = [];

  function walk(d: string) {
    for (const entry of readdirSync(d)) {
      const full = join(d, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
      } else if (entry.endsWith(".mdx")) {
        const content = readFileSync(full, "utf-8");
        const titleMatch = content.match(/^title:\s*(.+)$/m);
        const title = titleMatch ? titleMatch[1].trim() : entry.replace(".mdx", "");
        const rel = relative(docsDir, full).replace(/\\/g, "/").replace(/\.mdx$/, "");
        const urlPath = rel === "index" ? "/docs" : `/docs/${rel}`;
        results.push({ title, path: urlPath });
      }
    }
  }

  walk(dir);
  return results;
}

const docsIndex = scanDocs(docsDir);

const output: ContextOutput = {
  version: "1.0",
  generatedAt: new Date().toISOString(),
  api: apiSummary,
  docsIndex,
};

writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(`Written nexus-context.json (${apiSummary.services.length} services, ${docsIndex.length} docs)`);
