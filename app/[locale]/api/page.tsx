import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import type { ApiData } from "@/lib/api-types";
import { Footer } from "@/components/layout";
import { ApiClient } from "@/components/api/api-client";

export const metadata: Metadata = {
  title: "API",
  description: "Nexus AI API - Complete API documentation",
};

function loadApiData(): ApiData {
  const filePath = join(process.cwd(), "public", "api-data", "api.json");
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

export default function ApiPage() {
  const apiData = loadApiData();

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <ApiClient apiData={apiData} />
      </div>
      <Footer />
    </div>
  );
}
