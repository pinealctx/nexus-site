import type { ServiceInfo, MessageInfo, EnumInfo } from "@/lib/api-types";
import { MethodDetail } from "./method-detail";

interface Props {
  service: ServiceInfo;
  messages: Record<string, MessageInfo>;
  enums: Record<string, EnumInfo>;
}

export function ServiceSection({ service, messages, enums }: Props) {
  return (
    <section id={service.name} className="mb-16 scroll-mt-20">
      <div className="mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold tracking-tight">{service.name}</h2>
        {service.description && (
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {service.description}
          </p>
        )}
      </div>
      <div className="space-y-4">
        {service.methods.map((method) => (
          <MethodDetail
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
