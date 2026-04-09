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

const S3_BUCKET = process.env.S3_BUCKET;
const RELEASES_BASE_URL = S3_BUCKET ? `https://${S3_BUCKET}.s3.amazonaws.com/releases` : "";
const REVALIDATE_SECONDS = 600; // 10-minute TTL

async function loadRelease(filename: string): Promise<ProductRelease> {
  // Remote fetch with Next.js data cache (TTL = 10 min)
  if (RELEASES_BASE_URL) {
    try {
      const res = await fetch(`${RELEASES_BASE_URL}/${filename}`, {
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
  const [desktop, cli] = await Promise.all([
    loadRelease("desktop.json"),
    loadRelease("cli.json"),
  ]);
  return <DownloadClient desktop={desktop} cli={cli} />;
}
