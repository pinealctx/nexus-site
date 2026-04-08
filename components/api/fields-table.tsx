import type { EnumInfo, FieldInfo, MessageInfo, ValidationInfo } from "@/lib/api-types";
import { OptionBadge } from "./option-badge";

interface Props {
  fields: FieldInfo[];
  messages: Record<string, MessageInfo>;
  enums: Record<string, EnumInfo>;
}

export function FieldsTable({ fields, messages, enums }: Props) {
  const grouped = groupByOneof(fields);

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-left">
            <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Field</th>
            <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
            <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {grouped.map((item, idx) => {
            if (item.kind === "oneof-header") {
              return (
                <tr key={`oneof-${item.name}-${idx}`} className="border-b bg-amber-50/50">
                  <td colSpan={3} className="px-4 py-1.5 text-xs font-medium text-amber-700">
                    oneof <code className="rounded bg-amber-100 px-1.5 py-0.5">{item.name}</code>
                  </td>
                </tr>
              );
            }
            const f = item.field;
            return (
              <tr key={f.name} className="border-b transition-colors hover:bg-muted/30 last:border-b-0">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <code className="text-xs font-medium">{f.jsonName}</code>
                    {f.optional && <span className="text-[10px] text-muted-foreground">optional</span>}
                    {f.repeated && (
                      <span className="rounded bg-blue-100 px-1 text-[10px] font-medium text-blue-700">array</span>
                    )}
                    {f.sensitive && <OptionBadge type="sensitive" />}
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <TypeDisplay type={f.type} repeated={f.repeated} messages={messages} enums={enums} />
                  {f.validation && <ValidationDisplay v={f.validation} />}
                </td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{f.description}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

type GroupedItem = { kind: "oneof-header"; name: string } | { kind: "field"; field: FieldInfo };

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

function TypeDisplay({
  type,
  repeated: _repeated,
  messages,
  enums,
}: {
  type: string;
  repeated: boolean;
  messages: Record<string, MessageInfo>;
  enums: Record<string, EnumInfo>;
}) {
  const shortName = type.split(".").pop() || type;
  const isMessage = type in messages;
  const isEnum = type in enums;

  return (
    <code className="text-xs">
      {isMessage || isEnum ? (
        <a href={`#type-${shortName}`} className="text-primary hover:underline">
          {shortName}
        </a>
      ) : (
        shortName
      )}
    </code>
  );
}

function ValidationDisplay({ v }: { v: ValidationInfo }) {
  const parts: string[] = [];
  if (v.minLen !== undefined || v.maxLen !== undefined) {
    parts.push(`len: ${v.minLen ?? 0}..${v.maxLen ?? "∞"}`);
  }
  if (v.gt !== undefined) parts.push(`> ${v.gt}`);
  if (v.gte !== undefined) parts.push(`≥ ${v.gte}`);
  if (v.lte !== undefined) parts.push(`≤ ${v.lte}`);
  if (v.maxItems !== undefined) parts.push(`max: ${v.maxItems}`);

  if (parts.length === 0) return null;

  return <span className="ml-1 text-xs text-muted-foreground">[{parts.join(", ")}]</span>;
}
