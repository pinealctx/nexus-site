"use client";

import { Apple, ChevronRight, Cpu, Download, FileText, Monitor, Shield, Smartphone, Terminal } from "lucide-react";
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
  macos: <Apple className="h-4 w-4" />,
  windows: <Monitor className="h-4 w-4" />,
  linux: <Cpu className="h-4 w-4" />,
  ios: <Smartphone className="h-4 w-4" />,
  android: <Smartphone className="h-4 w-4" />,
};

function formatSize(bytes: number): string {
  if (bytes === 0) return "";
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string, locale: string): string {
  return new Date(dateStr).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function DownloadClient({ data }: { data: ReleaseData }) {
  const t = useTranslations("download");
  const locale = useLocale();
  const [detected, setDetected] = useState<PlatformInfo | null>(null);

  useEffect(() => {
    detectPlatform().then(setDetected);
  }, []);

  const matchedClient = detected
    ? data.client.find(
        (r) => r.platform === detected.platform && (r.arch === detected.arch || detected.arch === "universal"),
      ) || data.client.find((r) => r.platform === detected.platform)
    : null;
  const otherClients = data.client.filter((r) => r !== matchedClient);
  const matchedCli = detected
    ? data.cli.find(
        (r) => r.platform === detected.platform && (r.arch === detected.arch || detected.arch === "universal"),
      ) || data.cli.find((r) => r.platform === detected.platform)
    : null;

  return (
    <div className="flex flex-col">
      <section className="mx-auto flex w-full max-w-4xl flex-col items-center px-6 pt-20 pb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-[13px] text-muted-foreground">
          v{data.version}
          <span className="text-muted-foreground/40">·</span>
          <span className="text-xs">{formatDate(data.release_date, locale)}</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">{t("subtitle")}</p>
      </section>

      <ClientSection t={t} data={data} matchedClient={matchedClient} otherClients={otherClients} />

      <CliSection t={t} data={data} matchedCli={matchedCli} />

      <NotesSection t={t} notes={data.release_notes} />

      <RequirementsSection t={t} />
    </div>
  );
}

/* ── Section Components ── */

type T = ReturnType<typeof useTranslations<"download">>;

function ClientSection({
  t,
  data,
  matchedClient,
  otherClients,
}: {
  t: T;
  data: ReleaseData;
  matchedClient: ReleaseAsset | null | undefined;
  otherClients: ReleaseAsset[];
}) {
  return (
    <section className="mx-auto w-full max-w-4xl px-6 pb-12">
      <SectionHeader icon={<Monitor className="h-4 w-4" />} title={t("client_section")} desc={t("client_desc")} />
      <div className="mt-6 flex flex-col items-center gap-3">
        {matchedClient ? (
          matchedClient.available ? (
            <>
              <a
                href={matchedClient.download_url}
                className="group inline-flex items-center gap-3 rounded-xl bg-foreground px-8 py-3.5 text-base font-medium text-background transition-colors duration-150 hover:bg-foreground/85"
              >
                {PLATFORM_ICONS[matchedClient.platform] || <Download className="h-4 w-4" />}
                {t("download_for", {
                  platform: `${PLATFORM_LABELS[matchedClient.platform] || matchedClient.platform} (${matchedClient.arch})`,
                })}
              </a>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>
                  {t("version")}: {data.version}
                </span>
                {matchedClient.size_bytes > 0 && <span>{formatSize(matchedClient.size_bytes)}</span>}
              </div>
            </>
          ) : (
            <div className="inline-flex items-center gap-3 rounded-xl border border-dashed px-8 py-3.5 text-base font-medium text-muted-foreground">
              {PLATFORM_ICONS[matchedClient.platform] || <Download className="h-4 w-4" />}
              {PLATFORM_LABELS[matchedClient.platform] || matchedClient.platform} ({matchedClient.arch})
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
      {otherClients.length > 0 && (
        <div className="mt-10">
          <h3 className="mb-3 text-center text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
            {t("other_platforms")}
          </h3>
          <div className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {otherClients.map((r) => (
              <AssetCard key={`${r.platform}-${r.arch}`} asset={r} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function CliSection({ t, data, matchedCli }: { t: T; data: ReleaseData; matchedCli: ReleaseAsset | null | undefined }) {
  return (
    <section className="mx-auto w-full max-w-4xl border-t px-6 py-12">
      <SectionHeader icon={<Terminal className="h-4 w-4" />} title={t("cli_section")} desc={t("cli_desc")} />
      <div className="mt-6">
        {matchedCli && (
          <div className="mb-4 flex justify-center">
            <a
              href={matchedCli.download_url}
              className="inline-flex items-center gap-2 rounded-lg border bg-background px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
            >
              {PLATFORM_ICONS[matchedCli.platform] || <Terminal className="h-4 w-4" />}
              {t("download_for", {
                platform: `${PLATFORM_LABELS[matchedCli.platform] || matchedCli.platform} (${matchedCli.arch})`,
              })}
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
          </div>
        )}
        <div className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2">
          {data.cli
            .filter((r) => r !== matchedCli)
            .map((r) => (
              <AssetCard key={`cli-${r.platform}-${r.arch}`} asset={r} />
            ))}
        </div>
      </div>
    </section>
  );
}

function NotesSection({ t, notes }: { t: T; notes: string[] }) {
  return (
    <section className="mx-auto w-full max-w-4xl border-t px-6 py-12">
      <SectionHeader icon={<FileText className="h-4 w-4" />} title={t("release_notes")} />
      {notes.length > 0 ? (
        <ul className="mt-4 space-y-1.5">
          {notes.map((note, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground/30" />
              <span>{note}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">{t("no_release_notes")}</p>
      )}
    </section>
  );
}

function RequirementsSection({ t }: { t: T }) {
  return (
    <section className="mx-auto w-full max-w-4xl border-t px-6 py-12">
      <SectionHeader icon={<Shield className="h-4 w-4" />} title={t("requirements")} />
      <div className="mt-4 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
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
        <ReqCard icon={<Smartphone className="h-3.5 w-3.5" />} label="iOS" req={t("req_ios")} />
        <ReqCard icon={<Smartphone className="h-3.5 w-3.5" />} label="Android" req={t("req_android")} />
      </div>
    </section>
  );
}

/* ── Shared Components ── */

function SectionHeader({ icon, title, desc }: { icon: React.ReactNode; title: string; desc?: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-1.5 flex items-center gap-2 text-foreground">
        <span className="text-muted-foreground">{icon}</span>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      {desc && <p className="text-[13px] text-muted-foreground">{desc}</p>}
    </div>
  );
}

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
