import { ArrowRight, Bot, ChevronRight, Globe, Users, Zap } from "lucide-react";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { FadeIn } from "@/components/ui/fade-in";
import { Link } from "@/lib/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home");
  return {
    title: t("hero_title"),
    description: t("hero_slogan"),
    openGraph: {
      title: t("hero_title"),
      description: t("hero_slogan"),
      type: "website",
    },
  };
}

export default function Home() {
  const t = useTranslations("home");

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        {/* Dot grid background */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage: "radial-gradient(circle, oklch(0.5 0 0 / 0.15) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* Radial fade to hide grid edges */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_60%_at_50%_40%,transparent_20%,var(--color-background)_70%)]" />
        {/* Accent glow */}
        <div
          className="absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-[oklch(0.45_0.15_270/0.08)] blur-[100px]"
          style={{ animation: "glow-drift 8s ease-in-out infinite" }}
        />

        <div className="mx-auto flex max-w-4xl flex-col items-center px-6 pt-32 pb-24 text-center md:pt-44 md:pb-32">
          {/* Badge */}
          <div className="animate-entrance delay-0 mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground backdrop-blur-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            {t("hero_badge")}
          </div>

          <h1 className="animate-entrance delay-1 text-5xl font-bold tracking-[-0.04em] text-foreground md:text-7xl lg:text-8xl">
            {t("hero_title")}
          </h1>

          {/* Slogan */}
          <p className="animate-entrance delay-2 mt-5 font-mono text-[11px] tracking-[0.2em] text-muted-foreground/50 uppercase md:text-xs">
            {t("hero_slogan")}
          </p>

          <p className="animate-entrance delay-3 mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {t("hero_subtitle")}
          </p>

          <div className="animate-entrance delay-4 mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/download"
              className="group inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-colors duration-150 hover:bg-foreground/85"
            >
              {t("cta_download")}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              {t("cta_docs")}
            </Link>
          </div>

          <Link
            href="/docs/agent/quickstart"
            className="animate-entrance delay-5 mt-6 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <Bot className="h-3.5 w-3.5" />
            {t("cta_agent")}
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </section>

      {/* Features — bento layout */}
      <section className="border-t px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <FadeIn className="mb-16 max-w-xl">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{t("features_title")}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">{t("features_subtitle")}</p>
          </FadeIn>

          {/* Bento grid  */}
          <FadeIn>
            <div className="grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-2">
              <FeatureCell
                icon={<Bot className="h-5 w-5" />}
                title={t("feature_agent")}
                description={t("feature_agent_desc")}
              />
              <FeatureCell
                icon={<Zap className="h-5 w-5" />}
                title={t("feature_realtime")}
                description={t("feature_realtime_desc")}
              />
              <FeatureCell
                icon={<Globe className="h-5 w-5" />}
                title={t("feature_open")}
                description={t("feature_open_desc")}
              />
              <FeatureCell
                icon={<Users className="h-5 w-5" />}
                title={t("feature_groups")}
                description={t("feature_groups_desc")}
              />
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}

function FeatureCell({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group bg-background p-8 transition-all duration-200 ease-out hover:bg-accent/50 md:p-10">
      <div className="mb-4 text-muted-foreground transition-all duration-200 ease-out group-hover:-translate-y-0.5 group-hover:text-foreground">
        {icon}
      </div>
      <h3 className="mb-2 text-[15px] font-semibold tracking-tight">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
