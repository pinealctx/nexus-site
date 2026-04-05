# Nexus Site

Nexus 官方网站，包含产品主页、API 参考文档和 SDK 下载页面。支持中英文双语。

## 技术栈

- [Next.js](https://nextjs.org/) 15 (App Router)
- [React](https://react.dev/) 19
- [Tailwind CSS](https://tailwindcss.com/) 4
- [Fumadocs](https://fumadocs.vercel.app/) — MDX 文档框架
- [next-intl](https://next-intl.dev/) — 国际化 (zh-CN / en)
- [shadcn/ui](https://ui.shadcn.com/) — UI 组件
- [pnpm](https://pnpm.io/) — 包管理器

## 项目结构

```
app/                  # Next.js App Router 页面
  [locale]/
    (marketing)/      # 主页、下载页
    api/              # API 参考页
    docs/             # 文档页
components/           # React 组件
content/docs/         # MDX 文档内容 (en / zh-CN)
lib/                  # 工具函数与配置
messages/             # i18n 翻译文件
public/               # 静态资源与生成数据
scripts/              # 数据生成脚本
```

## 开始开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看网站。

## 构建

```bash
# 从同级 nexus-ai 项目生成 Protobuf descriptor（需要安装 buf）
pnpm gen:proto

# 生成 API 数据、上下文和 LLMs.txt
pnpm gen

# 构建
pnpm build
```

## 测试

```bash
pnpm vitest
```

## 部署

项目通过 [Vercel](https://vercel.com/) 部署，构建命令已在 `vercel.json` 中配置。

## License

Private
