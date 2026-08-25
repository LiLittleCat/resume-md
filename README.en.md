# Resume MD

[中文](./README.md) | English

**Write your resume in Markdown, preview the layout as you type, and export it directly to PDF when you're done.**

Edit the content on the left, see a live preview in the middle, and adjust the theme, fonts, spacing, avatar, and icons on the right. You can create and manage multiple resumes in either Chinese or English.

```
Markdown → Parser → Resume AST → Style Resolver → Semantic components → HTML/CSS → Chromium PDF
```

Resumes sit in this browser's `localStorage`. Clear site data or switch browsers and they are gone.

## Develop

```bash
pnpm install
pnpm exec playwright install chromium
pnpm dev
```

[http://localhost:3000](http://localhost:3000) opens the editor. Click Resume MD in the top left, or Back above the content panel, for the list at `/resumes`. You can keep more than one. 中 / EN only changes this resume's locale; it does not replace the Markdown.

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

See `examples/resume.zh-CN.md` and `examples/resume.en-US.md`. Front matter is name, photo, contact. H1 headings are sections. `工作经历` and `Experience` both map.

## Stack

Next.js App Router, React, TypeScript (strict), Tailwind CSS, shadcn/ui + Base UI, Zustand, Zod, Lucide, Playwright. Package manager is pnpm.

`core/` does not depend on React. Parser, locale, theme, and style resolution are pure functions with unit tests.

## Layout

```
core/          parser, schema, locale, theme, style, layout, icons, renderer
themes/        minimal (complete), modern and classic (skeletons with distinct tokens)
locales/       zh-CN, en-US
examples/      Chinese and English Markdown samples
components/    editor, preview, settings, resume document, shadcn/ui
app/resumes    resume list
app/api/pdf    Playwright export
```

## Design rules

- Style inheritance: Theme → Locale preset → Document config → Section override → Runtime
- Resume components only read resolved style
- Icons are semantic ids (`briefcase`), not Lucide component names
- Section identity is `section.id`, never the visible heading
- Print layout uses physical units: margins in mm and type in pt
- Resume document CSS uses physical units. Product chrome uses Tailwind
