export interface ApiData {
  version: string;
  generatedAt: string;
  services: ServiceInfo[];
  messages: Record<string, MessageInfo>;
  enums: Record<string, EnumInfo>;
}

export interface ServiceInfo {
  name: string;
  fullName: string;
  description: string;
  methods: MethodInfo[];
}

export interface MethodInfo {
  name: string;
  description: string;
  httpPath: string;
  options: {
    agentOnly: boolean;
    userOnly: boolean;
    skipAuth: boolean;
  };
  inputType: string;
  outputType: string;
}

export interface MessageInfo {
  name: string;
  fullName: string;
  description: string;
  fields: FieldInfo[];
}

export interface FieldInfo {
  name: string;
  jsonName: string;
  type: string;
  description: string;
  optional: boolean;
  repeated: boolean;
  oneofGroup?: string;
  sensitive: boolean;
  validation?: ValidationInfo;
}

export interface ValidationInfo {
  minLen?: number;
  maxLen?: number;
  gt?: number;
  gte?: number;
  lte?: number;
  maxItems?: number;
}

export interface EnumInfo {
  name: string;
  fullName: string;
  description: string;
  values: { name: string; number: number; description: string }[];
}
