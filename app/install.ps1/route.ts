import { readFileSync } from "node:fs";
import { join } from "node:path";

const PLACEHOLDER = "__RELEASES_URL_PLACEHOLDER__";
const S3_BUCKET = process.env.S3_BUCKET;

const template = readFileSync(join(process.cwd(), "lib", "install-scripts", "install.ps1"), "utf-8");

export function GET() {
  const releasesUrl = S3_BUCKET ? `https://${S3_BUCKET}.s3.amazonaws.com/releases/cli/channels/stable/cli.json` : "";
  const body = template.replaceAll(PLACEHOLDER, releasesUrl);

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
