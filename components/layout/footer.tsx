import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground text-background">
                <span className="text-[10px] font-bold">N</span>
              </div>
              <span className="text-sm font-semibold tracking-tight">Nexus AI</span>
            </div>
            <span className="hidden text-[13px] text-muted-foreground md:inline">
              {t("tagline")}
            </span>
          </div>

          <nav className="flex items-center gap-6 text-[13px]">
            <Link href="/docs" className="text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:text-foreground focus-visible:outline-none">
              {t("docs")}
            </Link>
            <Link href="/api" className="text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:text-foreground focus-visible:outline-none">
              {t("api")}
            </Link>
            <Link href="/download" className="text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:text-foreground focus-visible:outline-none">
              {t("download")}
            </Link>
          </nav>
        </div>

        <p className="mt-6 text-[11px] text-muted-foreground/60">
          {t("copyright", { year })}
        </p>
      </div>
    </footer>
  );
}
