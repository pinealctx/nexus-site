import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { createMDX } from "fumadocs-mdx/next";

const withNextIntl = createNextIntlPlugin("./lib/i18n.ts");
const withMDX = createMDX();

const nextConfig: NextConfig = {};

export default withMDX(withNextIntl(nextConfig));
