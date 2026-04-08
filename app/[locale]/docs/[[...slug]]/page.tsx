import defaultMdxComponents from "fumadocs-ui/mdx";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { source } from "@/lib/source";

interface Props {
  params: Promise<{ locale: string; slug?: string[] }>;
}

export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  const page = source.getPage(slug, locale);
  if (!page) notFound();

  // biome-ignore lint/suspicious/noExplicitAny: fumadocs page data type is not exported
  const data = page.data as any;
  const Content = data.body;

  return (
    <DocsPage toc={data.toc}>
      <DocsTitle>{data.title}</DocsTitle>
      <DocsDescription>{data.description}</DocsDescription>
      <DocsBody>
        <Content components={{ ...defaultMdxComponents }} />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}
