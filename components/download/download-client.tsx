"use client";

import { Apple, Cpu, Download, Monitor, Shield, Terminal } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { detectPlatform, type PlatformInfo } from "@/lib/platform";

interface ReleaseAsset {
  platform: string;
  arch: string;
  available: boolean;
  download_url: string;
  checksum_sha256: string;
  size_bytes: number;
}

interface ProductRelease {
  version: string;
  release_date: string;
  assets: ReleaseAsset[];
}

const PLATFORM_LABELS: Record<string, string> = {
  macos: "macOS",
  windows: "Windows",
  linux: "Linux",
};

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  macos: <Apple className="h-4 w-4" />,
  windows: <Monitor className="h-4 w-4" />,
  linux: <Cpu className="h-4 w-4" />,
};

function formatSize(bytes: number): string {
  if (bytes === 0) return "";
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string, locale: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function DownloadClient({ desktop, cli }: { desktop: ProductRelease; cli: ProductRelease }) {
  const t = useTranslations("download");
  const locale = useLocale();
  const [detected, setDetected] = useState<PlatformInfo | null>(null);

  useEffect(() => {
    detectPlatform().then(setDetected);
  }, []);

  return (
    <div className="flex flex-col">
      {/* Page header */}
      <section className="mx-auto flex w-full max-w-4xl flex-col items-center px-6 pt-20 pb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">{t("subtitle")}</p>
      </section>

      {/* Desktop section */}
      <ProductSection
        icon={<Monitor className="h-4 w-4" />}
        title={t("desktop_section")}
        desc={t("desktop_desc")}
        release={desktop}
        detected={detected}
        locale={locale}
        t={t}
      />

      {/* CLI section */}
      <section className="mx-auto w-full max-w-4xl border-t px-6 py-12">
        {/* Section header */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-1.5 flex items-center gap-2 text-foreground">
            <span className="text-muted-foreground">
              <Terminal className="h-4 w-4" />
            </span>
            <h2 className="text-lg font-semibold tracking-tight">{t("cli_section")}</h2>
          </div>
          <p className="text-[13px] text-muted-foreground">{t("cli_desc")}</p>
          {cli.version !== "0.0.0" && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-[13px] text-muted-foreground">
              v{cli.version}
              {cli.release_date && (
                <>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="text-xs">{formatDate(cli.release_date, locale)}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* One-liner install (primary) */}
        <CliInstallHint detected={detected} t={t} />

        {/* Direct download (secondary) */}
        <ProductSection
          icon={<Download className="h-4 w-4" />}
          title={t("cli_install_hint_alt")}
          desc=""
          release={cli}
          detected={detected}
          locale={locale}
          t={t}
          hideVersion
        />
      </section>

      {/* System requirements */}
      <RequirementsSection t={t} />
    </div>
  );
}

/* ── Product Section ── */

type T = ReturnType<typeof useTranslations<"download">>;

function ProductSection({
  icon,
  title,
  desc,
  release,
  detected,
  locale,
  t,
  hideVersion,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  release: ProductRelease;
  detected: PlatformInfo | null;
  locale: string;
  t: T;
  hideVersion?: boolean;
}) {
  const matched = detected
    ? release.assets.find(
        (r) => r.platform === detected.platform && (r.arch === detected.arch || detected.arch === "universal"),
      ) || release.assets.find((r) => r.platform === detected.platform)
    : null;
  const others = release.assets.filter((r) => r !== matched);

  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-12">
      {/* Section header with version badge */}
      <div className="flex flex-col items-center text-center">
        <div className="mb-1.5 flex items-center gap-2 text-foreground">
          <span className="text-muted-foreground">{icon}</span>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        </div>
        {desc && <p className="text-[13px] text-muted-foreground">{desc}</p>}
        {!hideVersion && release.version !== "0.0.0" && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-[13px] text-muted-foreground">
            v{release.version}
            {release.release_date && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-xs">{formatDate(release.release_date, locale)}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Primary download button */}
      <div className="mt-6 flex flex-col items-center gap-3">
        {matched ? (
          matched.available ? (
            <>
              <a
                href={matched.download_url}
                className="group inline-flex items-center gap-3 rounded-xl bg-foreground px-8 py-3.5 text-base font-medium text-background transition-colors duration-150 hover:bg-foreground/85"
              >
                {PLATFORM_ICONS[matched.platform] || <Download className="h-4 w-4" />}
                {t("download_for", {
                  platform: `${PLATFORM_LABELS[matched.platform] || matched.platform} (${matched.arch})`,
                })}
              </a>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>v{release.version}</span>
                {matched.size_bytes > 0 && <span>{formatSize(matched.size_bytes)}</span>}
              </div>
            </>
          ) : (
            <div className="inline-flex items-center gap-3 rounded-xl border border-dashed px-8 py-3.5 text-base font-medium text-muted-foreground">
              {PLATFORM_ICONS[matched.platform] || <Download className="h-4 w-4" />}
              {PLATFORM_LABELS[matched.platform] || matched.platform} ({matched.arch})
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium">{t("coming_soon")}</span>
            </div>
          )
        ) : (
          <div className="flex h-14 items-center gap-3 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {t("detecting")}
          </div>
        )}
      </div>

      {/* Other platforms grid */}
      {others.length > 0 && (
        <div className="mt-10">
          <h3 className="mb-3 text-center text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
            {t("other_platforms")}
          </h3>
          <div className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {others.map((r) => (
              <AssetCard key={`${r.platform}-${r.arch}`} asset={r} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* ── CLI Install Hint ── */

function CliInstallHint({ detected, t }: { detected: PlatformInfo | null; t: T }) {
  const isWindows = detected?.platform === "windows";
  const origin = typeof window !== "undefined" ? window.location.origin.replace(/^http:/, "https:") : "";

  const shCmd = `curl -fsSL ${origin}/install.sh | bash`;
  const psCmd = `irm ${origin}/install.ps1 | iex`;

  return (
    <div className="mt-8 flex flex-col items-center gap-2">
      <p className="text-[13px] text-muted-foreground">{t("cli_install_hint")}</p>
      {isWindows ? (
        <>
          <code className="rounded-lg border bg-muted/50 px-4 py-2.5 text-sm font-mono select-all">{psCmd}</code>
          <p className="mt-1 text-[11px] text-muted-foreground/50">
            Linux / macOS: <code className="font-mono">{shCmd}</code>
          </p>
        </>
      ) : (
        <>
          <code className="rounded-lg border bg-muted/50 px-4 py-2.5 text-sm font-mono select-all">{shCmd}</code>
          <p className="mt-1 text-[11px] text-muted-foreground/50">
            Windows (PowerShell): <code className="font-mono">{psCmd}</code>
          </p>
        </>
      )}
      <p className="mt-1 text-xs text-muted-foreground/60">{t("cli_update_hint")}</p>
    </div>
  );
}

/* ── Requirements ── */

function RequirementsSection({ t }: { t: T }) {
  return (
    <section className="mx-auto w-full max-w-4xl border-t px-6 py-12">
      <div className="flex flex-col items-center text-center">
        <div className="mb-1.5 flex items-center gap-2 text-foreground">
          <span className="text-muted-foreground">
            <Shield className="h-4 w-4" />
          </span>
          <h2 className="text-lg font-semibold tracking-tight">{t("requirements")}</h2>
        </div>
      </div>
      <div className="mt-4 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3">
        <ReqCard
          icon={<Apple className="h-3.5 w-3.5" />}
          label="macOS"
          req={t("req_macos")}
          hint={t("install_hint_macos")}
        />
        <ReqCard
          icon={<Monitor className="h-3.5 w-3.5" />}
          label="Windows"
          req={t("req_windows")}
          hint={t("install_hint_windows")}
        />
        <ReqCard
          icon={<Cpu className="h-3.5 w-3.5" />}
          label="Linux"
          req={t("req_linux")}
          hint={t("install_hint_linux")}
        />
      </div>
    </section>
  );
}

/* ── Shared Components ── */

function AssetCard({ asset }: { asset: ReleaseAsset }) {
  const t = useTranslations("download");
  if (!asset.available) {
    return (
      <div className="flex items-center gap-3 bg-background p-4 text-sm text-muted-foreground">
        <span>{PLATFORM_ICONS[asset.platform] || <Download className="h-4 w-4" />}</span>
        <div className="flex-1">
          <span className="font-medium">{PLATFORM_LABELS[asset.platform] || asset.platform}</span>
          <span className="ml-1.5 text-muted-foreground/60">({asset.arch})</span>
        </div>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">{t("coming_soon")}</span>
      </div>
    );
  }
  return (
    <a
      href={asset.download_url}
      className="flex items-center gap-3 bg-background p-4 text-sm transition-colors hover:bg-accent/50"
    >
      <span className="text-muted-foreground">
        {PLATFORM_ICONS[asset.platform] || <Download className="h-4 w-4" />}
      </span>
      <div className="flex-1">
        <span className="font-medium">{PLATFORM_LABELS[asset.platform] || asset.platform}</span>
        <span className="ml-1.5 text-muted-foreground/60">({asset.arch})</span>
      </div>
      <span className="text-xs text-muted-foreground">{formatSize(asset.size_bytes)}</span>
    </a>
  );
}

function ReqCard({ icon, label, req, hint }: { icon: React.ReactNode; label: string; req: string; hint?: string }) {
  return (
    <div className="bg-background p-4">
      <div className="mb-1.5 flex items-center gap-2 text-[13px] font-medium">
        <span className="text-muted-foreground">{icon}</span>
        {label}
      </div>
      <p className="text-xs text-muted-foreground">{req}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground/50">{hint}</p>}
    </div>
  );
}
