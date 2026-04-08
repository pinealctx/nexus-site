import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { RootProvider } from "fumadocs-ui/provider";
import type { ReactNode } from "react";
import { source } from "@/lib/source";

const zhTranslations = {
  search: "搜索",
  searchNoResult: "没有找到结果",
  toc: "目录",
  tocNoHeadings: "无标题",
  lastUpdate: "最后更新",
  chooseLanguage: "选择语言",
  nextPage: "下一页",
  previousPage: "上一页",
  chooseTheme: "选择主题",
  editOnGithub: "在 GitHub 上编辑",
};

interface Props {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function Layout({ children, params }: Props) {
  const { locale } = await params;

  return (
    <RootProvider
      theme={{ enabled: false }}
      i18n={{
        locale,
        translations: locale === "zh-CN" ? zhTranslations : undefined,
      }}
      search={{
        options: {
          api: `/${locale}/docs/search`,
        },
      }}
    >
      <DocsLayout
        tree={source.getPageTree(locale)}
        nav={{ enabled: false }}
        themeSwitch={{ enabled: false }}
        sidebar={{ footer: null }}
        containerProps={{ style: { "--fd-nav-height": "4rem" } as React.CSSProperties }}
      >
        {children}
      </DocsLayout>
    </RootProvider>
  );
}
