"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import type { ApiData } from "@/lib/api-types";
import { Search, ArrowRight, Braces, Hash, X } from "lucide-react";

interface SearchResult {
  type: "method" | "schema" | "enum";
  label: string;
  description?: string;
  anchor: string;
  service?: string;
}

interface ApiSearchDialogProps {
  apiData: ApiData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApiSearchDialog({ apiData, open, onOpenChange }: ApiSearchDialogProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const allItems = useMemo<SearchResult[]>(() => {
    const items: SearchResult[] = [];
    for (const svc of apiData.services) {
      for (const m of svc.methods) {
        items.push({
          type: "method",
          label: m.name,
          description: m.httpPath,
          anchor: `${svc.name}-${m.name}`,
          service: svc.name,
        });
      }
    }
    for (const msg of Object.values(apiData.messages)) {
      if (msg.fields.length > 0 && !msg.name.endsWith("Request") && !msg.name.endsWith("Response")) {
        items.push({
          type: "schema",
          label: msg.name,
          description: msg.fullName,
          anchor: `schema-${msg.name}`,
        });
      }
    }
    for (const e of Object.values(apiData.enums)) {
      items.push({
        type: "enum",
        label: e.name,
        description: e.fullName,
        anchor: `enum-${e.name}`,
      });
    }
    return items;
  }, [apiData]);

  const results = useMemo(() => {
    if (!query.trim()) return allItems.slice(0, 20);
    const q = query.toLowerCase();
    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.service?.toLowerCase().includes(q)
    );
  }, [allItems, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const navigate = useCallback(
    (anchor: string) => {
      onOpenChange(false);
      const el = document.getElementById(anchor);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState(null, "", `#${anchor}`);
      }
    },
    [onOpenChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        navigate(results[selectedIndex].anchor);
      } else if (e.key === "Escape") {
        onOpenChange(false);
      }
    },
    [results, selectedIndex, navigate, onOpenChange]
  );

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.children[selectedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (!open) return null;

  const iconForType = (type: SearchResult["type"]) => {
    switch (type) {
      case "method":
        return <ArrowRight className="h-4 w-4 shrink-0 text-emerald-500" />;
      case "schema":
        return <Braces className="h-4 w-4 shrink-0 text-primary" />;
      case "enum":
        return <Hash className="h-4 w-4 shrink-0 text-purple-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => onOpenChange(false)} />

      {/* Dialog */}
      <div className="relative w-full max-w-lg rounded-xl border bg-background shadow-2xl">
        {/* Search input */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search endpoints, schemas, enums..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">No results found</div>
          ) : (
            results.map((item, i) => (
              <button
                key={item.anchor}
                type="button"
                onClick={() => navigate(item.anchor)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                  i === selectedIndex
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                {iconForType(item.type)}
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{item.label}</div>
                  {item.description && (
                    <div className="truncate text-xs text-muted-foreground">{item.description}</div>
                  )}
                </div>
                {item.service && (
                  <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {item.service}
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 border-t px-4 py-2 text-[10px] text-muted-foreground">
          <span><kbd className="rounded border bg-muted px-1 py-0.5 font-mono">↑↓</kbd> Navigate</span>
          <span><kbd className="rounded border bg-muted px-1 py-0.5 font-mono">↵</kbd> Open</span>
          <span><kbd className="rounded border bg-muted px-1 py-0.5 font-mono">Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}
