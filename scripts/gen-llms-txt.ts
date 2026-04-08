/**
 * gen-llms-txt.ts
 *
 * Generates public/llms.txt following the llms.txt convention.
 * Describes the site structure and API overview for LLM consumption.
 *
 * Usage: pnpm tsx scripts/gen-llms-txt.ts
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(__dirname, "..");
const apiDataPath = join(ROOT, "public", "api-data", "api.json");
const docsDir = join(ROOT, "content", "docs", "zh-CN");
const outputPath = join(ROOT, "public", "llms.txt");

interface ApiData {
  services: { name: string; fullName: string; methods: { name: string; httpPath: string }[] }[];
}

const apiData: ApiData = JSON.parse(readFileSync(apiDataPath, "utf-8"));

const lines: string[] = [
  "# Nexus AI",
  "",
  "> The Conversational Operating System for Agents.",
  "",
  "## Site Structure",
  "",
  "- / - Homepage",
  "- /docs - Developer documentation",
  "- /api - API reference (auto-generated from Protobuf)",
  "- /download - Client downloads",
  "",
  "## Documentation",
  "",
];

function scanDocs(dir: string) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      scanDocs(full);
    } else if (entry.endsWith(".mdx")) {
      const content = readFileSync(full, "utf-8");
      const titleMatch = content.match(/^title:\s*(.+)$/m);
      const title = titleMatch ? titleMatch[1].trim() : entry.replace(".mdx", "");
      const rel = relative(docsDir, full)
        .replace(/\\/g, "/")
        .replace(/\.mdx$/, "");
      const urlPath = rel === "index" ? "/docs" : `/docs/${rel}`;
      lines.push(`- [${title}](${urlPath})`);
    }
  }
}

scanDocs(docsDir);

lines.push("", "## API Services", "");
for (const svc of apiData.services) {
  lines.push(`### ${svc.name}`);
  for (const m of svc.methods) {
    lines.push(`- POST ${m.httpPath}`);
  }
  lines.push("");
}

lines.push("## Machine-Readable Context", "");
lines.push("For structured API data, fetch /nexus-context.json");

writeFileSync(outputPath, lines.join("\n"));
console.log(`Written llms.txt (${lines.length} lines)`);
