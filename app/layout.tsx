import type { ReactNode } from "react";

// Root layout is a pass-through; the actual layout with i18n
// is in app/[locale]/layout.tsx.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
