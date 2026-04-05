"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import type { ApiData, ServiceInfo, MethodInfo, MessageInfo, EnumInfo, FieldInfo, ValidationInfo } from "@/lib/api-types";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  ChevronDown,
  Search,
  Copy,
  Check,
  Hash,
  ArrowRight,
  Shield,
  Bot,
  User,
  Braces,
  List,
  ExternalLink,
} from "lucide-react";

// ─── Main Client Component ──────────────────────────────────

// Returns true if the message is a reusable schema type (not a Request/Response wrapper).
function isSchemaMessage(name: string): boolean {
  return !name.endsWith("Request") && !name.endsWith("Response");
}

// Renders a protobuf description with proper paragraph breaks and list items.
function Description({ text, className }: { text: string; className?: string }) {
  const blocks = text.split("\n\n");
  return (
    <div className={cn("space-y-2", className)}>
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        const listItems = lines.filter((l) => /^[-*] /.test(l));
        if (listItems.length > 0) {
          // Mixed block: render non-list lines as text, list lines as <ul>
          const nonList = lines.filter((l) => !/^[-*] /.test(l)).join(" ").trim();
          return (
            <div key={i}>
              {nonList && <p>{nonList}</p>}
              <ul className="mt-1 list-inside list-disc space-y-0.5 pl-1">
                {listItems.map((item, j) => (
                  <li key={j}>{item.replace(/^[-*] /, "")}</li>
                ))}
              </ul>
            </div>
          );
        }
        // Plain paragraph — join continuation lines
        return <p key={i}>{lines.join(" ").trim()}</p>;
      })}
    </div>
  );
}

interface ReferenceClientProps {
  apiData: ApiData;
}

export function ReferenceClient({ apiData }: ReferenceClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  // Sync activeSection from URL hash changes (e.g. clicking jump links in content)
  const syncFromHash = useCallback(() => {
    const hash = window.location.hash.slice(1); // remove #
    if (hash) {
      setActiveSection(hash);
    }
  }, []);

  useEffect(() => {
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [syncFromHash]);

  // Scroll the active sidebar item into view when activeSection changes
  useEffect(() => {
    if (!activeSection || !sidebarRef.current) return;
    const el = sidebarRef.current.querySelector(`[data-section="${activeSection}"]`);
    if (el) {
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeSection]);

  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return apiData.services;
    const q = searchQuery.toLowerCase();
    return apiData.services
      .map((svc) => ({
        ...svc,
        methods: svc.methods.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.httpPath.toLowerCase().includes(q) ||
            m.description?.toLowerCase().includes(q)
        ),
      }))
      .filter((svc) => svc.methods.length > 0 || svc.name.toLowerCase().includes(q));
  }, [apiData.services, searchQuery]);

  return (
    <div className="mx-auto flex w-full max-w-[1400px] gap-0">
      {/* Sidebar */}
      <aside className="hidden w-72 shrink-0 border-r lg:block">
        <div className="sticky top-16 flex max-h-[calc(100vh-4rem)] flex-col">
          {/* Search */}
          <div className="border-b p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search endpoints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border bg-muted/50 py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:bg-background"
              />
            </div>
          </div>

          {/* Nav */}
          <nav ref={sidebarRef} className="flex-1 overflow-y-auto p-3">
            <div className="mb-4">
              <span className="px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Endpoints
              </span>
            </div>
            {filteredServices.map((svc) => (
              <SidebarService
                key={svc.fullName}
                service={svc}
                activeSection={activeSection}
                onSelect={setActiveSection}
              />
            ))}

            {/* Types section */}
            <div className="mt-6 border-t pt-4">
              <span className="px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Schemas
              </span>
              <div className="mt-2 space-y-0.5">
                {Object.values(apiData.messages)
                  .filter((m) => m.fields.length > 0 && isSchemaMessage(m.name))
                  .map((m) => (
                    <a
                      key={m.fullName}
                      href={`#schema-${m.name}`}
                      data-section={`schema-${m.name}`}
                      onClick={() => setActiveSection(`schema-${m.name}`)}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                        activeSection === `schema-${m.name}`
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <Braces className="h-3 w-3 shrink-0 text-primary" />
                      <span className="truncate">{m.name}</span>
                    </a>
                  ))}
                {Object.values(apiData.enums).map((e) => (
                  <a
                    key={e.fullName}
                    href={`#enum-${e.name}`}
                    data-section={`enum-${e.name}`}
                    onClick={() => setActiveSection(`enum-${e.name}`)}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                      activeSection === `enum-${e.name}`
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <Hash className="h-3 w-3 shrink-0 text-purple-500" />
                    <span className="truncate">{e.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1">
        {/* Header */}
        <div className="border-b bg-muted/30 px-8 py-10">
          <h1 className="text-3xl font-bold tracking-tight">API Reference</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Connect RPC API — {apiData.services.length} services,{" "}
            {apiData.services.reduce((n, s) => n + s.methods.length, 0)} endpoints
          </p>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span>Base URL: <code className="rounded bg-muted px-1.5 py-0.5 font-mono">https://nexus-dev.xsyphon.com</code></span>
            <span>Protocol: <code className="rounded bg-muted px-1.5 py-0.5 font-mono">Connect RPC</code></span>
          </div>
        </div>

        {/* Service sections */}
        <div className="divide-y">
          {filteredServices.map((svc) => (
            <ServiceBlock
              key={svc.fullName}
              service={svc}
              messages={apiData.messages}
              enums={apiData.enums}
            />
          ))}
        </div>

        {/* Schema section */}
        <div className="border-t">
          <div className="border-b bg-muted/30 px-8 py-6">
            <h2 className="text-xl font-bold tracking-tight">Schemas</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Message types and enumerations used across the API
            </p>
          </div>

          {/* Referenced messages */}
          <div className="divide-y">
            {Object.values(apiData.messages)
              .filter((m) => m.fields.length > 0 && isSchemaMessage(m.name))
              .map((msg) => (
                <MessageSchema key={msg.fullName} message={msg} messages={apiData.messages} enums={apiData.enums} />
              ))}
          </div>

          {/* Enums */}
          <div className="divide-y">
            {Object.values(apiData.enums).map((e) => (
              <EnumSchema key={e.fullName} enumInfo={e} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Sidebar Service ────────────────────────────────────────

function SidebarService({
  service,
  activeSection,
  onSelect,
}: {
  service: ServiceInfo;
  activeSection: string | null;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}
        <span className="truncate">{service.name}</span>
        <span className="ml-auto text-[10px] text-muted-foreground">{service.methods.length}</span>
      </button>
      {open && (
        <div className="ml-3 mt-0.5 space-y-0.5 border-l pl-3">
          {service.methods.map((m) => {
            const id = `${service.name}-${m.name}`;
            return (
              <a
                key={m.name}
                href={`#${id}`}
                data-section={id}
                onClick={() => onSelect(id)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                  activeSection === id
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <MethodBadge method={m} />
                <span className="truncate">{m.name}</span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MethodBadge({ method }: { method: MethodInfo }) {
  if (method.options.agentOnly)
    return <Bot className="h-3 w-3 shrink-0 text-orange-500" />;
  if (method.options.skipAuth)
    return <Shield className="h-3 w-3 shrink-0 text-emerald-500" />;
  if (method.options.userOnly)
    return <User className="h-3 w-3 shrink-0 text-blue-500" />;
  return <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />;
}

// ─── Service Block ──────────────────────────────────────────

function ServiceBlock({
  service,
  messages,
  enums,
}: {
  service: ServiceInfo;
  messages: Record<string, MessageInfo>;
  enums: Record<string, EnumInfo>;
}) {
  return (
    <section id={service.name} className="scroll-mt-20">
      <div className="border-b bg-muted/20 px-8 py-5">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold">{service.name}</h2>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
            {service.methods.length} endpoints
          </span>
        </div>
        {service.description && (
          <Description text={service.description} className="mt-1.5 text-sm text-muted-foreground" />
        )}
      </div>
      <div className="divide-y">
        {service.methods.map((method) => (
          <EndpointBlock
            key={method.name}
            serviceName={service.name}
            method={method}
            messages={messages}
            enums={enums}
          />
        ))}
      </div>
    </section>
  );
}

// ─── Endpoint Block ─────────────────────────────────────────

function EndpointBlock({
  serviceName,
  method,
  messages,
  enums,
}: {
  serviceName: string;
  method: MethodInfo;
  messages: Record<string, MessageInfo>;
  enums: Record<string, EnumInfo>;
}) {
  const inputMsg = messages[method.inputType];
  const outputMsg = messages[method.outputType];

  return (
    <div id={`${serviceName}-${method.name}`} className="scroll-mt-20">
      <div className="grid gap-0 xl:grid-cols-2">
        {/* Left: documentation */}
        <div className="border-r px-8 py-6">
          {/* Title + badges */}
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold">{method.name}</h3>
            {method.options.agentOnly && <OptionTag type="agentOnly" />}
            {method.options.userOnly && <OptionTag type="userOnly" />}
            {method.options.skipAuth && <OptionTag type="skipAuth" />}
          </div>

          {method.description && (
            <Description text={method.description} className="mt-3 text-sm leading-relaxed text-muted-foreground" />
          )}

          {/* Request */}
          {inputMsg && inputMsg.fields.length > 0 && (
            <div className="mt-6">
              <SectionHeading>Request Body</SectionHeading>
              <SchemaLink name={inputMsg.name} fullName={inputMsg.fullName} />
              <FieldsList fields={inputMsg.fields} messages={messages} enums={enums} />
            </div>
          )}

          {/* Response */}
          {outputMsg && outputMsg.fields.length > 0 && (
            <div className="mt-6">
              <SectionHeading>Response</SectionHeading>
              <SchemaLink name={outputMsg.name} fullName={outputMsg.fullName} />
              <FieldsList fields={outputMsg.fields} messages={messages} enums={enums} />
            </div>
          )}
        </div>

        {/* Right: code example */}
        <div className="bg-muted/30 px-8 py-6">
          <EndpointExample method={method} inputMsg={inputMsg} />
        </div>
      </div>
    </div>
  );
}

// ─── Endpoint Code Example ──────────────────────────────────

function EndpointExample({ method, inputMsg }: { method: MethodInfo; inputMsg?: MessageInfo }) {
  const [copied, setCopied] = useState(false);

  const curlExample = useMemo(() => {
    const body = inputMsg && inputMsg.fields.length > 0
      ? generateExampleBody(inputMsg.fields)
      : {};
    const bodyStr = JSON.stringify(body, null, 2);
    return `curl -X POST https://nexus-dev.xsyphon.com${method.httpPath} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '${bodyStr}'`;
  }, [method, inputMsg]);

  function handleCopy() {
    navigator.clipboard.writeText(curlExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-lg border bg-muted/50">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="rounded bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            POST
          </span>
          <code className="text-xs text-muted-foreground">{method.httpPath}</code>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Copy"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      {/* Body */}
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-foreground/80">
        <code>{curlExample}</code>
      </pre>
    </div>
  );
}

function generateExampleBody(fields: FieldInfo[]): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const f of fields) {
    if (f.oneofGroup && f.optional) continue; // skip synthetic optional oneof
    const val = getExampleValue(f);
    if (f.repeated) {
      body[f.jsonName] = [val];
    } else {
      body[f.jsonName] = val;
    }
  }
  return body;
}

function getExampleValue(f: FieldInfo): unknown {
  const t = f.type.split(".").pop() || f.type;
  switch (f.type) {
    case "string": return f.validation?.minLen ? "a".repeat(f.validation.minLen) : "string";
    case "int32": case "int64": case "uint32": case "uint64":
    case "sint32": case "sint64": case "fixed32": case "fixed64":
    case "sfixed32": case "sfixed64":
      return f.validation?.gt ?? f.validation?.gte ?? 0;
    case "float": case "double": return 0.0;
    case "bool": return false;
    case "bytes": return "";
    default:
      if (t.endsWith("Type") || t.endsWith("Status") || t.endsWith("Role")) return 0;
      return {};
  }
}

// ─── Fields List (compact schema view) ──────────────────────

function FieldsList({
  fields,
  messages,
  enums,
  depth = 0,
}: {
  fields: FieldInfo[];
  messages: Record<string, MessageInfo>;
  enums: Record<string, EnumInfo>;
  depth?: number;
}) {
  const grouped = groupByOneof(fields);

  return (
    <div className={cn("mt-3 divide-y rounded-lg border", depth > 0 && "ml-4 mt-2")}>
      {grouped.map((item, idx) => {
        if (item.kind === "oneof-header") {
          return (
            <div key={`oneof-${item.name}-${idx}`} className="bg-amber-50/80 px-4 py-2 dark:bg-amber-950/20">
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                oneof <code className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 font-mono dark:bg-amber-900/40">{item.name}</code>
              </span>
            </div>
          );
        }
        return (
          <FieldRow
            key={item.field.name}
            field={item.field}
            messages={messages}
            enums={enums}
            depth={depth}
          />
        );
      })}
    </div>
  );
}

function FieldRow({
  field: f,
  messages,
  enums,
  depth,
}: {
  field: FieldInfo;
  messages: Record<string, MessageInfo>;
  enums: Record<string, EnumInfo>;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const nestedMsg = messages[f.type];
  const nestedEnum = enums[f.type];
  const isExpandable = (nestedMsg && nestedMsg.fields.length > 0) || !!nestedEnum;
  const shortType = f.type.split(".").pop() || f.type;
  // Show a jump link if this type has a full definition in the Schemas section
  const hasSchemaAnchor = (nestedMsg && isSchemaMessage(nestedMsg.name)) || !!nestedEnum;

  return (
    <div className="group">
      <div
        className={cn(
          "flex items-start gap-3 px-4 py-3 transition-colors",
          isExpandable && "cursor-pointer hover:bg-muted/50"
        )}
        onClick={isExpandable ? () => setExpanded(!expanded) : undefined}
      >
        {/* Field name + meta */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <code className="text-sm font-medium">{f.jsonName}</code>
            {!f.optional && !f.oneofGroup && (
              <span className="text-[10px] font-semibold uppercase text-red-500">required</span>
            )}
            {f.repeated && (
              <span className="inline-flex items-center gap-0.5 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                <List className="h-2.5 w-2.5" /> array
              </span>
            )}
            {f.sensitive && (
              <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-900/40 dark:text-red-300">
                sensitive
              </span>
            )}
          </div>
          {f.description && (
            <Description text={f.description} className="mt-1 text-xs leading-relaxed text-muted-foreground" />
          )}
          {f.validation && <ValidationBadges v={f.validation} />}
        </div>

        {/* Type */}
        <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
          {isExpandable ? (
            <span className="inline-flex items-center gap-1">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-xs text-primary transition-colors hover:bg-muted"
              >
                {nestedEnum ? <Hash className="h-3 w-3" /> : <Braces className="h-3 w-3" />}
                {shortType}
                <ChevronRight className={cn("h-3 w-3 transition-transform", expanded && "rotate-90")} />
              </button>
              {hasSchemaAnchor && (
                <a
                  href={`#${nestedEnum ? "enum" : "schema"}-${shortType}`}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
                  title="Jump to definition"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </span>
          ) : (
            <span className="font-mono text-xs text-muted-foreground">{shortType}</span>
          )}
        </div>
      </div>

      {/* Expanded nested schema */}
      {expanded && nestedMsg && (
        <div className="border-t bg-muted/20 px-4 py-3">
          <FieldsList fields={nestedMsg.fields} messages={messages} enums={enums} depth={depth + 1} />
        </div>
      )}
      {expanded && nestedEnum && (
        <div className="border-t bg-muted/20 px-4 py-3">
          <EnumValues enumInfo={nestedEnum} />
        </div>
      )}
    </div>
  );
}

// ─── Message Schema (full page section) ────────────────────

function MessageSchema({
  message,
  messages,
  enums,
}: {
  message: MessageInfo;
  messages: Record<string, MessageInfo>;
  enums: Record<string, EnumInfo>;
}) {
  return (
    <div id={`schema-${message.name}`} className="scroll-mt-20 px-8 py-6">
      <div className="flex items-center gap-2">
        <Braces className="h-4 w-4 text-primary" />
        <h3 className="font-mono text-sm font-semibold">{message.name}</h3>
        <code className="rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{message.fullName}</code>
      </div>
      {message.description && (
        <Description text={message.description} className="mt-2 text-sm text-muted-foreground" />
      )}
      <FieldsList fields={message.fields} messages={messages} enums={enums} />
    </div>
  );
}

// ─── Enum Schema ────────────────────────────────────────────

function EnumSchema({ enumInfo }: { enumInfo: EnumInfo }) {
  return (
    <div id={`enum-${enumInfo.name}`} className="scroll-mt-20 px-8 py-6">
      <div className="flex items-center gap-2">
        <Hash className="h-4 w-4 text-purple-500" />
        <h3 className="font-mono text-sm font-semibold">{enumInfo.name}</h3>
        <code className="rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{enumInfo.fullName}</code>
      </div>
      {enumInfo.description && (
        <Description text={enumInfo.description} className="mt-2 text-sm text-muted-foreground" />
      )}
      <EnumValues enumInfo={enumInfo} />
    </div>
  );
}

function EnumValues({ enumInfo }: { enumInfo: EnumInfo }) {
  return (
    <div className="mt-3 overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Value</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Number</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {enumInfo.values.map((v) => (
            <tr key={v.name} className="transition-colors hover:bg-muted/30">
              <td className="px-4 py-2">
                <code className="text-xs font-medium">{v.name}</code>
              </td>
              <td className="px-4 py-2">
                <span className="font-mono text-xs text-muted-foreground">{v.number}</span>
              </td>
              <td className="px-4 py-2 text-xs text-muted-foreground">{v.description || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Shared UI ──────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{children}</h4>
  );
}

function SchemaLink({ name, fullName }: { name: string; fullName: string }) {
  return (
    <a
      href={`#schema-${name}`}
      className="mb-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
    >
      <Braces className="h-3 w-3" />
      {fullName}
    </a>
  );
}

function OptionTag({ type }: { type: "agentOnly" | "userOnly" | "skipAuth" }) {
  const cfg = {
    agentOnly: { label: "Agent Only", icon: Bot, cls: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-300" },
    userOnly: { label: "User Only", icon: User, cls: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300" },
    skipAuth: { label: "No Auth", icon: Shield, cls: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/50 dark:text-green-300" },
  }[type];
  const Icon = cfg.icon;

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium", cfg.cls)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function ValidationBadges({ v }: { v: ValidationInfo }) {
  const parts: string[] = [];
  if (v.minLen !== undefined || v.maxLen !== undefined) {
    parts.push(`len: ${v.minLen ?? 0}..${v.maxLen ?? "∞"}`);
  }
  if (v.gt !== undefined) parts.push(`> ${v.gt}`);
  if (v.gte !== undefined) parts.push(`≥ ${v.gte}`);
  if (v.lte !== undefined) parts.push(`≤ ${v.lte}`);
  if (v.maxItems !== undefined) parts.push(`max items: ${v.maxItems}`);
  if (parts.length === 0) return null;

  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {parts.map((p) => (
        <span key={p} className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
          {p}
        </span>
      ))}
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────

type GroupedItem =
  | { kind: "oneof-header"; name: string }
  | { kind: "field"; field: FieldInfo };

function groupByOneof(fields: FieldInfo[]): GroupedItem[] {
  const result: GroupedItem[] = [];
  const seenOneofs = new Set<string>();
  for (const f of fields) {
    if (f.oneofGroup && !f.optional) {
      if (!seenOneofs.has(f.oneofGroup)) {
        seenOneofs.add(f.oneofGroup);
        result.push({ kind: "oneof-header", name: f.oneofGroup });
      }
    }
    result.push({ kind: "field", field: f });
  }
  return result;
}
