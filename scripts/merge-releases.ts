/**
 * merge-releases.ts
 *
 * Merges independent release fragments (cli.json, client.json) from
 * the releases/ directory into a single public/latest-releases.json.
 *
 * Each fragment follows:
 *   { "version": "x.y.z", "release_date": "YYYY-MM-DD", "assets": [...] }
 *
 * The merged output matches the schema consumed by the download page:
 *   { "version", "release_date", "release_notes", "client": [...], "cli": [...] }
 *
 * Usage: tsx scripts/merge-releases.ts
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

interface Asset {
  platform: string;
  arch: string;
  available: boolean;
  download_url: string;
  checksum_sha256: string;
  size_bytes: number;
}

interface Fragment {
  version: string;
  release_date: string;
  assets: Asset[];
}

interface Releases {
  version: string;
  release_date: string;
  release_notes: string[];
  client: Asset[];
  cli: Asset[];
}

const ROOT = resolve(__dirname, "..");
const RELEASES_DIR = resolve(ROOT, "releases");
const OUT = resolve(ROOT, "public", "latest-releases.json");

function loadFragment(name: string): Fragment | null {
  const p = resolve(RELEASES_DIR, name);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf-8"));
}

// Load existing output as base (preserves release_notes and any manual edits)
function loadExisting(): Releases {
  if (existsSync(OUT)) {
    return JSON.parse(readFileSync(OUT, "utf-8"));
  }
  return {
    version: "0.0.0",
    release_date: "",
    release_notes: [],
    client: [],
    cli: [],
  };
}

// Default client placeholders when no client.json fragment exists
const DEFAULT_CLIENT: Asset[] = [
  { platform: "macos", arch: "arm64", available: false, download_url: "", checksum_sha256: "", size_bytes: 0 },
  { platform: "macos", arch: "x86_64", available: false, download_url: "", checksum_sha256: "", size_bytes: 0 },
  { platform: "windows", arch: "x86_64", available: false, download_url: "", checksum_sha256: "", size_bytes: 0 },
  { platform: "linux", arch: "x86_64", available: false, download_url: "", checksum_sha256: "", size_bytes: 0 },
  { platform: "ios", arch: "arm64", available: false, download_url: "", checksum_sha256: "", size_bytes: 0 },
  { platform: "android", arch: "arm64", available: false, download_url: "", checksum_sha256: "", size_bytes: 0 },
];

function main() {
  const existing = loadExisting();
  const cli = loadFragment("cli.json");
  const client = loadFragment("client.json");

  // Pick the latest version/date from whichever fragment is newer
  const versions = [cli, client].filter(Boolean) as Fragment[];
  const latest = versions.sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }))[0];

  const merged: Releases = {
    version: latest?.version ?? existing.version,
    release_date: latest?.release_date ?? existing.release_date,
    release_notes: existing.release_notes, // always preserve from existing
    client: client?.assets ?? existing.client ?? DEFAULT_CLIENT,
    cli: cli?.assets ?? existing.cli ?? [],
  };

  writeFileSync(OUT, `${JSON.stringify(merged, null, 2)}\n`);
  console.log(`Merged releases → ${OUT} (v${merged.version})`);
}

main();
