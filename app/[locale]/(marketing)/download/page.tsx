import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DownloadClient } from "@/components/download/download-client";

export interface ReleaseAsset {
  platform: string;
  arch: string;
  available: boolean;
  download_url: string;
  checksum_sha256: string;
  size_bytes: number;
}

export interface ProductRelease {
  version: string;
  release_date: string;
  assets: ReleaseAsset[];
}

const RELEASES_BASE_URL = process.env.RELEASES_BASE_URL;
const RELEASE_CHANNEL = process.env.RELEASE_CHANNEL || "stable";
const RELEASE_URLS: Record<string, string | undefined> = RELEASES_BASE_URL
  ? {
      "desktop.json": `${RELEASES_BASE_URL}/desktop/channels/${RELEASE_CHANNEL}/desktop.json`,
      "cli.json": `${RELEASES_BASE_URL}/cli/channels/${RELEASE_CHANNEL}/cli.json`,
    }
  : {};
const REVALIDATE_SECONDS = 60; // 1-minute TTL

async function loadRelease(filename: string): Promise<ProductRelease> {
  // Remote fetch with Next.js data cache (TTL = 10 min)
  const releaseUrl = RELEASE_URLS[filename];
  if (releaseUrl) {
    try {
      const res = await fetch(releaseUrl, {
        next: { revalidate: REVALIDATE_SECONDS },
      });
      if (res.ok) {
        return res.json();
      }
    } catch {
      // Fall through to local file
    }
  }

  // Fallback: local file (build-time copy or dev fixtures)
  try {
    const filePath = join(process.cwd(), "public", "releases", filename);
    return JSON.parse(readFileSync(filePath, "utf-8"));
  } catch {
    return { version: "0.0.0", release_date: "", assets: [] };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("download");
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function DownloadPage() {
  const [desktop, cli] = await Promise.all([loadRelease("desktop.json"), loadRelease("cli.json")]);
  return <DownloadClient desktop={desktop} cli={cli} />;
}
