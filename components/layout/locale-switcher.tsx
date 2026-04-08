"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { type Locale, locales } from "@/lib/i18n-config";
import { usePathname, useRouter } from "@/lib/navigation";

export function LocaleSwitcher() {
  const t = useTranslations("locale_switcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function onChange(newLocale: string) {
    router.replace(pathname, { locale: newLocale as Locale });
  }

  return (
    <div className="relative inline-flex items-center">
      <Languages className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
      <select
        value={locale}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-md border bg-background py-1.5 pl-8 pr-7 text-[13px] font-medium transition-colors duration-150 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label={t("label")}
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {t(loc)}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
        role="presentation"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}
