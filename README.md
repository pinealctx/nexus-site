# Nexus Site

Nexus 官方网站，包含产品主页、MDX 文档、自动生成的 API 参考文档和跨平台下载页面。支持中英文双语（zh-CN 默认，en 次要）。

## 技术栈

- [Next.js](https://nextjs.org/) 15 (App Router) + [React](https://react.dev/) 19
- [Tailwind CSS](https://tailwindcss.com/) 4 + [@base-ui/react](https://base-ui.com/)
- [Fumadocs](https://fumadocs.vercel.app/) — MDX 文档框架
- [next-intl](https://next-intl.dev/) v4 — 国际化 (zh-CN / en)
- [next-themes](https://github.com/pacocoursey/next-themes) — 深色/浅色主题
- [Biome](https://biomejs.dev/) — Lint + Format
- [Vitest](https://vitest.dev/) — 测试
- 部署于 [Vercel](https://vercel.com/)

## 开始开发

```bash
pnpm install          # 安装依赖
pnpm dev              # 启动开发服务器 (http://localhost:3000)
```

## 构建

```bash
# 从同级 nexus-proto 项目生成 Protobuf descriptor（需要安装 buf）
pnpm gen:proto

# 生成 API 数据、上下文和 LLMs.txt
pnpm gen

# 构建
pnpm build
```

## Release 数据

下载页和 CLI 安装脚本通过稳定 channel manifest 获取最新版本信息：

```bash
S3_BUCKET=<bucket>
```

站点会自动派生：

- `https://<bucket>.s3.amazonaws.com/releases/desktop/channels/stable/desktop.json`
- `https://<bucket>.s3.amazonaws.com/releases/cli/channels/stable/cli.json`

如果未配置 `S3_BUCKET`，下载页会回退到 `public/releases/*.json` 本地 fixture；安装脚本会保留占位符并在执行时失败。

## 测试与 Lint

```bash
pnpm vitest           # 运行测试
pnpm lint             # Biome check
pnpm format           # Biome format
```

## 项目结构

```
app/                  # Next.js App Router 页面
  [locale]/
    (marketing)/      # 主页、下载页
    api/              # API 参考页（非 API 路由）
    docs/             # Fumadocs 文档页
components/           # React 组件
  api/                # API 参考文档组件
  download/           # 下载页组件
  layout/             # Navbar、Footer、LocaleSwitcher
  ui/                 # 基础 UI 组件
content/docs/         # MDX 文档内容 (en / zh-CN)
lib/                  # 工具函数、i18n 配置、Fumadocs 配置
messages/             # next-intl 翻译文件
public/               # 静态资源与生成数据
scripts/              # 数据生成脚本（tsx）
```

## 国际化

- 默认语言为 **zh-CN**，英文为次要语言
- `localePrefix: "as-needed"`：zh-CN URL 无前缀，en 使用 `/en/` 前缀
- UI 字符串：`messages/zh-CN.json` + `messages/en.json`
- MDX 内容：`content/docs/zh-CN/` + `content/docs/en/`

## 许可证

私有项目。
