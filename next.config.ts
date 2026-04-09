import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./lib/i18n.ts");
const withMDX = createMDX();

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/install.sh": ["./lib/install-scripts/install.sh"],
    "/install.ps1": ["./lib/install-scripts/install.ps1"],
  },
};

export default withMDX(withNextIntl(nextConfig));
