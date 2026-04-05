import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background">
                <span className="text-xs font-bold">N</span>
              </div>
              <span className="text-base font-bold">Nexus AI</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("tagline")}
            </p>
          </div>

          {/* Links */}
          <nav className="flex gap-8 text-sm">
            <Link href="/docs" className="text-muted-foreground transition-colors hover:text-foreground">
              {t("docs")}
            </Link>
            <Link href="/api" className="text-muted-foreground transition-colors hover:text-foreground">
              {t("api")}
            </Link>
            <Link href="/download" className="text-muted-foreground transition-colors hover:text-foreground">
              {t("download")}
            </Link>
          </nav>
        </div>

        <div className="mt-8 border-t pt-6">
          <p className="text-center text-xs text-muted-foreground">
            {t("copyright", { year })}
          </p>
        </div>
      </div>
    </footer>
  );
}
