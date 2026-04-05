import createMiddleware from "next-intl/middleware";
import { routing } from "@/lib/navigation";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
