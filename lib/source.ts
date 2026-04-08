import { loader } from "fumadocs-core/source";
import { docs } from "@/.source";
import { i18n } from "./fumadocs-i18n";

export const source = loader(docs.toFumadocsSource(), {
  baseUrl: "/docs",
  i18n,
});
