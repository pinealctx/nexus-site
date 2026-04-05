"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { detectPlatform, type PlatformInfo } from "@/lib/platform";
import {
  Download,
  Monitor,
  Smartphone,
  Apple,
  Cpu,
  Terminal,
  ChevronRight,
  FileText,
  Shield,
} from "lucide-react";

interface ReleaseAsset {
  platform: string;
  arch: string;
  available: boolean;
  download_url: string;
  checksum_sha256: string;
  size_bytes: number;
}

interface ReleaseData {
  version: string;
  release_date: string;
  release_notes: string[];
  client: ReleaseAsset[];
  cli: ReleaseAsset[];
}

const PLATFORM_LABELS: Record<string, string> = {
  macos: "macOS",
  windows: "Windows",
  linux: "Linux",
  ios: "iOS",
  android: "Android",
};

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  macos: <Apple className="h-5 w-5" />,
  windows: <Monitor className="h-5 w-5" />,
  linux: <Cpu className="h-5 w-5" />,
  ios: <Smartphone className="h-5 w-5" />,
  android: <Smartphone className="h-5 w-5" />,
};

function formatSize(bytes: number): string {
  if (bytes === 0) return "";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function DownloadClient({ data }: { data: ReleaseData }) {
  const t = useTranslations("download");
  const [detected, setDetected] = useState<PlatformInfo | null>(null);

  useEffect(() => {
    detectPlatform().then(setDetected);
  }, []);

  const matchedClient = detected
    ? data.client.find(
        (r) =>
          r.platform === detected.platform &&
          (r.arch === detected.arch || detected.arch === "universal")
      ) || data.client.find((r) => r.platform === detected.platform)
    : null;

  const otherClients = data.client.filter((r) => r !== matchedClient);

  const matchedCli = detected
    ? data.cli.find(
        (r) =>
          r.platform === detected.platform &&
          (r.arch === detected.arch || detected.arch === "universal")
      ) || data.cli.find((r) => r.platform === detected.platform)
    : null;

  return (
    <div className="flex flex-col">
      {/* Hero header */}
      <section className="mx-auto flex w-full max-w-4xl flex-col items-center px-6 pt-20 pb-12 text-center">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm text-muted-foreground">
          <Download className="h-4 w-4" />
          v{data.version}
          <span className="text-xs">·</span>
          <span className="text-xs">{formatDate(data.release_date)}</span>
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">{t("title")}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{t("subtitle")}</p>
      </section>

      {/* ── Client Downloads ── */}
      <section className="mx-auto w-full max-w-4xl px-6 pb-12">
        <SectionHeader icon={<Monitor className="h-5 w-5" />} title={t("client_section")} desc={t("client_desc")} />

        {/* Primary download */}
        <div className="mt-6 flex flex-col items-center gap-3">
          {matchedClient ? (
            matchedClient.available ? (
              <>
                <a
                  href={matchedClient.download_url}
                  className="inline-flex items-center gap-3 rounded-xl bg-foreground px-10 py-4 text-lg font-semibold text-background shadow-lg transition-all hover:bg-foreground/90 hover:shadow-xl"
                >
                  {PLATFORM_ICONS[matchedClient.platform] || <Download className="h-5 w-5" />}
                  {t("download_for", {
                    platform: `${PLATFORM_LABELS[matchedClient.platform] || matchedClient.platform} (${matchedClient.arch})`,
                  })}
                </a>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{t("version")}: {data.version}</span>
                  {matchedClient.size_bytes > 0 && <span>{formatSize(matchedClient.size_bytes)}</span>}
                </div>
              </>
            ) : (
              <div className="inline-flex items-center gap-3 rounded-xl border border-dashed px-10 py-4 text-lg font-semibold text-muted-foreground">
                {PLATFORM_ICONS[matchedClient.platform] || <Download className="h-5 w-5" />}
                {PLATFORM_LABELS[matchedClient.platform] || matchedClient.platform} ({matchedClient.arch})
                <span className="rounded-full bg-muted px-3 py-0.5 text-xs">{t("coming_soon")}</span>
              </div>
            )
          ) : (
            <div className="flex h-16 items-center gap-3 text-muted-foreground">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {t("detecting")}
            </div>
          )}
        </div>

        {/* Other platforms */}
        {otherClients.length > 0 && (
          <div className="mt-10">
            <h3 className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t("other_platforms")}
            </h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {otherClients.map((r) => (
                <AssetCard key={`${r.platform}-${r.arch}`} asset={r} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── CLI Downloads ── */}
      <section className="mx-auto w-full max-w-4xl border-t px-6 py-12">
        <SectionHeader icon={<Terminal className="h-5 w-5" />} title={t("cli_section")} desc={t("cli_desc")} />

        <div className="mt-6">
          {matchedCli && (
            <div className="mb-4 flex justify-center">
              <a
                href={matchedCli.download_url}
                className="inline-flex items-center gap-2 rounded-lg border bg-card px-6 py-3 text-sm font-semibold transition-all hover:shadow-md hover:shadow-black/5"
              >
                {PLATFORM_ICONS[matchedCli.platform] || <Terminal className="h-4 w-4" />}
                {t("download_for", {
                  platform: `${PLATFORM_LABELS[matchedCli.platform] || matchedCli.platform} (${matchedCli.arch})`,
                })}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </a>
            </div>
          )}
          <div className="grid gap-2 sm:grid-cols-2">
            {data.cli
              .filter((r) => r !== matchedCli)
              .map((r) => (
                <AssetCard key={`cli-${r.platform}-${r.arch}`} asset={r} />
              ))}
          </div>
        </div>
      </section>

      {/* ── Release Notes ── */}
      <section className="mx-auto w-full max-w-4xl border-t px-6 py-12">
        <SectionHeader icon={<FileText className="h-5 w-5" />} title={t("release_notes")} />
        {data.release_notes.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {data.release_notes.map((note, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-foreground/40" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">{t("no_release_notes")}</p>
        )}
      </section>

      {/* ── System Requirements ── */}
      <section className="mx-auto w-full max-w-4xl border-t px-6 py-12">
        <SectionHeader icon={<Shield className="h-5 w-5" />} title={t("requirements")} />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ReqCard icon={<Apple className="h-4 w-4" />} label="macOS" req={t("req_macos")} hint={t("install_hint_macos")} />
          <ReqCard icon={<Monitor className="h-4 w-4" />} label="Windows" req={t("req_windows")} hint={t("install_hint_windows")} />
          <ReqCard icon={<Cpu className="h-4 w-4" />} label="Linux" req={t("req_linux")} hint={t("install_hint_linux")} />
          <ReqCard icon={<Smartphone className="h-4 w-4" />} label="iOS" req={t("req_ios")} />
          <ReqCard icon={<Smartphone className="h-4 w-4" />} label="Android" req={t("req_android")} />
        </div>
      </section>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────

function SectionHeader({ icon, title, desc }: { icon: React.ReactNode; title: string; desc?: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-2 inline-flex items-center gap-2 text-foreground">
        {icon}
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      {desc && <p className="text-sm text-muted-foreground">{desc}</p>}
    </div>
  );
}

function AssetCard({ asset }: { asset: ReleaseAsset }) {
  const t = useTranslations("download");

  if (!asset.available) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-dashed bg-card p-4 text-sm text-muted-foreground">
        <span>{PLATFORM_ICONS[asset.platform] || <Download className="h-4 w-4" />}</span>
        <div className="flex-1">
          <span className="font-medium">{PLATFORM_LABELS[asset.platform] || asset.platform}</span>
          <span className="ml-1.5">({asset.arch})</span>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium">{t("coming_soon")}</span>
      </div>
    );
  }

  return (
    <a
      href={asset.download_url}
      className="flex items-center gap-3 rounded-lg border bg-card p-4 text-sm transition-all hover:shadow-md hover:shadow-black/5"
    >
      <span className="text-muted-foreground">
        {PLATFORM_ICONS[asset.platform] || <Download className="h-4 w-4" />}
      </span>
      <div className="flex-1">
        <span className="font-medium">{PLATFORM_LABELS[asset.platform] || asset.platform}</span>
        <span className="ml-1.5 text-muted-foreground">({asset.arch})</span>
      </div>
      <span className="text-xs text-muted-foreground">{formatSize(asset.size_bytes)}</span>
    </a>
  );
}

function ReqCard({ icon, label, req, hint }: { icon: React.ReactNode; label: string; req: string; hint?: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
        <span className="text-muted-foreground">{icon}</span>
        {label}
      </div>
      <p className="text-xs text-muted-foreground">{req}</p>
      {hint && <p className="mt-1.5 text-xs text-muted-foreground/70">{hint}</p>}
    </div>
  );
}
