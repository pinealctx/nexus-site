import type { MethodInfo, MessageInfo, EnumInfo } from "@/lib/api-types";
import { OptionBadge } from "./option-badge";
import { FieldsTable } from "./fields-table";

interface Props {
  serviceName: string;
  method: MethodInfo;
  messages: Record<string, MessageInfo>;
  enums: Record<string, EnumInfo>;
}

export function MethodDetail({ serviceName, method, messages, enums }: Props) {
  const inputMsg = messages[method.inputType];
  const outputMsg = messages[method.outputType];

  return (
    <div id={`${serviceName}-${method.name}`} className="scroll-mt-20 rounded-lg border bg-card p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold">{method.name}</h3>
        {method.options.agentOnly && <OptionBadge type="agentOnly" />}
        {method.options.userOnly && <OptionBadge type="userOnly" />}
        {method.options.skipAuth && <OptionBadge type="skipAuth" />}
      </div>

      <code className="mt-2 block rounded bg-muted px-3 py-1.5 text-xs text-muted-foreground">
        POST {method.httpPath}
      </code>

      {method.description && (
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{method.description}</p>
      )}

      {inputMsg && inputMsg.fields.length > 0 && (
        <div className="mt-5">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Request — {inputMsg.name}
          </h4>
          <FieldsTable fields={inputMsg.fields} messages={messages} enums={enums} />
        </div>
      )}

      {outputMsg && outputMsg.fields.length > 0 && (
        <div className="mt-5">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Response — {outputMsg.name}
          </h4>
          <FieldsTable fields={outputMsg.fields} messages={messages} enums={enums} />
        </div>
      )}
    </div>
  );
}
