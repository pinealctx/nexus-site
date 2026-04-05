"use client";

import { useState } from "react";
import type { ServiceInfo } from "@/lib/api-types";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface Props {
  services: ServiceInfo[];
}

export function ServiceSidebar({ services }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(services.map((s) => s.fullName)));

  function toggle(fullName: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(fullName)) next.delete(fullName);
      else next.add(fullName);
      return next;
    });
  }

  return (
    <nav className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-lg border bg-card p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Services</h3>
      <ul className="space-y-1 text-sm">
        {services.map((svc) => (
          <li key={svc.fullName}>
            <button
              type="button"
              onClick={() => toggle(svc.fullName)}
              className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 font-medium transition-colors hover:bg-accent"
            >
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
                  expanded.has(svc.fullName) && "rotate-90"
                )}
              />
              <a href={`#${svc.name}`} className="truncate">
                {svc.name}
              </a>
            </button>
            {expanded.has(svc.fullName) && (
              <ul className="ml-5 mt-0.5 space-y-0.5 border-l pl-3">
                {svc.methods.map((m) => (
                  <li key={m.name}>
                    <a
                      href={`#${svc.name}-${m.name}`}
                      className={cn(
                        "block truncate rounded-md px-2 py-1 text-xs transition-colors",
                        m.options.agentOnly
                          ? "text-orange-600 hover:bg-orange-50"
                          : m.options.skipAuth
                            ? "text-emerald-600 hover:bg-emerald-50"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      {m.name}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
