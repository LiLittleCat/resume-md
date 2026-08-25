# Resume MD

中文 | [English](./README.en.md)

用 Markdown 写简历，实时看 A4 预览，导出 PDF。

左边写内容，中间看排版，右边调主题、字体、间距、头像和图标。支持多份简历，中英文都可以。

## 运行

需要 Node.js 20.9+ 和 pnpm。

```bash
pnpm install
pnpm exec playwright install chromium
pnpm dev
```

编辑器：[http://localhost:3000](http://localhost:3000)

简历列表：[http://localhost:3000/resumes](http://localhost:3000/resumes)

## Markdown 格式

个人信息写在 front matter 里。一级标题是章节，二级标题是一段经历或一个项目，三级标题用来分职责、成果、技术栈等内容。

```md
---
name: 张三
title: 后端开发工程师
avatar: /examples/zhangsan.jpg

contact:
  phone: 138-0000-1111
  email: zhangsan@example.com
  location: 杭州
  github: https://github.com/zhangsan
---

# 工作经历

## 临江数据科技有限公司

**后端开发工程师** | 2022.10 - 至今 | 杭州

负责订单与库存服务。

### 主要职责

- 设计订单状态机和失败补偿流程
- 优化接口性能和可观测性

### 主要成果

- 将订单查询 P95 从 420ms 降到 168ms
```

常见的中英文标题会自动识别，例如 `工作经历` / `Experience`、`项目经历` / `Projects`、`技术能力` / `Skills`。不认识的一级标题会按普通章节渲染。

完整例子：

- [中文简历](./examples/resume.zh-CN.md)
- [英文简历](./examples/resume.en-US.md)
- [默认配置](./examples/resume.config.json)

## 数据放在哪里

简历和设计配置存在当前浏览器的 `localStorage`。没有账号，也没有数据库。清除站点数据或换浏览器后，内容不会自动回来。

上传的头像会转成 data URL 一起保存，会占用浏览器存储空间。

导出 PDF 时，当前 Markdown 和配置会发到本项目的 `/api/pdf`，由 Playwright 启动 Chromium 打印。

## 代码

```text
Markdown → Parser → Resume AST → Style Resolver → React → HTML/CSS → PDF
```

主要目录：

```text
core/          解析、schema、locale、主题、样式和分页
themes/        minimal、modern、classic
locales/       zh-CN、en-US
examples/      中英文示例
components/    编辑器、预览、设计面板和简历组件
app/resumes/   简历列表
app/api/pdf/   PDF 导出
tests/         单元测试
```

`core/` 不依赖 React、Next.js 和 DOM。简历组件只接收解析好的数据和 `ResolvedDocumentStyle`。

样式覆盖顺序：

```text
Theme → Locale preset → Document config → Section override → Runtime
```

其他约定：

- 章节用 `section.id` 标识，不用显示出来的标题；
- 图标保存 `briefcase` 这样的语义 id，不保存 Lucide 组件名；
- 简历 CSS 用 `pt`、`mm`，编辑器界面用 Tailwind；
- 预览和 PDF 使用同一套简历组件与样式。

## 检查

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```
