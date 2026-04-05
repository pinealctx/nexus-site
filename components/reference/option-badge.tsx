import { cn } from "@/lib/utils";

interface Props {
  type: "agentOnly" | "userOnly" | "skipAuth" | "sensitive";
}

const config = {
  agentOnly: { label: "Agent Only", className: "bg-orange-100 text-orange-700 border-orange-200" },
  userOnly: { label: "User Only", className: "bg-blue-100 text-blue-700 border-blue-200" },
  skipAuth: { label: "No Auth", className: "bg-green-100 text-green-700 border-green-200" },
  sensitive: { label: "Sensitive", className: "bg-red-100 text-red-700 border-red-200" },
};

export function OptionBadge({ type }: Props) {
  const c = config[type];
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", c.className)}>
      {c.label}
    </span>
  );
}
