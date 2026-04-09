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

function loadRelease(filename: string): ProductRelease {
  const filePath = join(process.cwd(), "public", "releases", filename);
  try {
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

export default function DownloadPage() {
  const desktop = loadRelease("desktop.json");
  const cli = loadRelease("cli.json");
  return <DownloadClient desktop={desktop} cli={cli} />;
}
