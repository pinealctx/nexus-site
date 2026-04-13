"use client";

import { Menu, Moon, Sun, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, usePathname } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { LocaleSwitcher } from "./locale-switcher";

const navItems = [
  { href: "/", labelKey: "home" },
  { href: "/docs", labelKey: "docs" },
  { href: "/api", labelKey: "api" },
  { href: "/download", labelKey: "download" },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    mobileToggleRef.current?.focus();
  }, []);

  // Focus first link when mobile menu opens
  useEffect(() => {
    if (mobileOpen) {
      setTimeout(() => firstLinkRef.current?.focus(), 0);
    }
  }, [mobileOpen]);

  // Close mobile menu on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobile();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [mobileOpen, closeMobile]);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Gradient border line — visible in dark mode */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-border dark:bg-linear-to-r dark:from-transparent dark:via-foreground/15 dark:to-transparent" />

      <div className="bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background">
              <span className="text-xs font-bold tracking-tight">N</span>
            </div>
            <span className="text-sm font-semibold tracking-tight">Nexus AI</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors duration-150",
                  isActive(pathname, item.href) ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {isActive(pathname, item.href) && <span className="absolute inset-0 rounded-md bg-foreground/6" />}
                <span className="relative">{t(item.labelKey)}</span>
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <LocaleSwitcher />
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            ref={mobileToggleRef}
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          ref={mobileMenuRef}
          id="mobile-menu"
          className="border-t bg-background/95 px-6 pb-6 pt-4 backdrop-blur-xl md:hidden"
        >
          <nav className="flex flex-col gap-0.5">
            {navItems.map((item, idx) => (
              <Link
                key={item.href}
                href={item.href}
                ref={idx === 0 ? firstLinkRef : undefined}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                  isActive(pathname, item.href)
                    ? "bg-foreground/6 text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </nav>
          <div className="mt-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <LocaleSwitcher />
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
                aria-label="Toggle theme"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
