import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/navigation";
import { Bot, Zap, Globe, Users, ArrowRight } from "lucide-react";

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
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,rgba(120,119,198,0.12),transparent)]" />
          <div className="absolute -right-32 -top-32 h-[600px] w-[600px] rounded-full bg-violet-500/[0.04] blur-3xl" />
          <div className="absolute -left-32 top-1/3 h-[500px] w-[500px] rounded-full bg-blue-500/[0.04] blur-3xl" />
        </div>

        <div className="mx-auto flex max-w-4xl flex-col items-center px-6 py-32 text-center md:py-44">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.03] px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground">
            <Bot className="h-3.5 w-3.5" />
            {t("hero_badge")}
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-foreground md:text-7xl">
            {t("hero_title")}
          </h1>

          {/* Slogan — always English, typographic emphasis */}
          <p className="mt-5 font-mono text-sm tracking-widest text-muted-foreground/70 uppercase">
            {t("hero_slogan")}
          </p>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            {t("hero_subtitle")}
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link
              href="/download"
              className="inline-flex items-center gap-2 rounded-lg bg-foreground px-8 py-3.5 text-sm font-semibold text-background shadow-lg shadow-foreground/10 transition-all hover:bg-foreground/90 hover:shadow-xl"
            >
              {t("cta_download")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-accent"
            >
              {t("cta_docs")}
            </Link>
          </div>

          {/* Agent CTA */}
          <Link
            href="/docs/agent/quickstart"
            className="mt-6 inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
          >
            <Bot className="h-4 w-4" />
            {t("cta_agent")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              {t("features_title")}
            </h2>
            <p className="mt-4 text-muted-foreground">
              {t("features_subtitle")}
            </p>
          </div>

          <div className="mt-20 grid gap-8 md:grid-cols-2">
            <FeatureCard
              icon={<Bot className="h-6 w-6" />}
              title={t("feature_agent")}
              description={t("feature_agent_desc")}
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title={t("feature_realtime")}
              description={t("feature_realtime_desc")}
            />
            <FeatureCard
              icon={<Globe className="h-6 w-6" />}
              title={t("feature_open")}
              description={t("feature_open_desc")}
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title={t("feature_groups")}
              description={t("feature_groups_desc")}
            />
          </div>
        </div>
      </section>
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative rounded-2xl border bg-card p-8 transition-all hover:shadow-lg hover:shadow-black/5">
      <div className="mb-5 inline-flex rounded-xl bg-foreground/[0.05] p-3 text-foreground">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
