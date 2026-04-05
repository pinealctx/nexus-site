import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DownloadClient } from "@/components/download/download-client";

export interface ReleaseData {
  version: string;
  release_date: string;
  release_notes: string[];
  client: ReleaseAsset[];
  cli: ReleaseAsset[];
}

export interface ReleaseAsset {
  platform: string;
  arch: string;
  available: boolean;
  download_url: string;
  checksum_sha256: string;
  size_bytes: number;
}

function loadReleases(): ReleaseData {
  const filePath = join(process.cwd(), "public", "latest-releases.json");
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("download");
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default function DownloadPage() {
  const data = loadReleases();
  return <DownloadClient data={data} />;
}
