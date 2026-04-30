import { readFileSync } from "node:fs";
import { join } from "node:path";

const PLACEHOLDER = "__RELEASES_URL_PLACEHOLDER__";
const RELEASES_BASE_URL = process.env.RELEASES_BASE_URL;
const RELEASE_CHANNEL = process.env.RELEASE_CHANNEL || "stable";

const template = readFileSync(join(process.cwd(), "lib", "install-scripts", "install.ps1"), "utf-8");

export function GET() {
  const releasesUrl = RELEASES_BASE_URL ? `${RELEASES_BASE_URL}/cli/channels/${RELEASE_CHANNEL}/cli.json` : "";
  const body = template.replaceAll(PLACEHOLDER, releasesUrl);

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
