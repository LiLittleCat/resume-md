# Resume MD

Write a resume in Markdown, preview it on a real A4 page, and export a PDF.

Markdown stays content. A schema-backed AST, theme, and style resolver handle presentation. The layout engine renders semantic resume components, then Playwright prints the same HTML you see in preview.

```
Markdown → Parser → Resume AST → Style Resolver → Semantic components → HTML/CSS → Chromium PDF
```

## Stack

Next.js App Router, React, TypeScript (strict), Tailwind CSS, shadcn/ui + Base UI, Zustand, Zod, Lucide, Playwright.

`core/` does not depend on React. Parser, locale, theme, and style resolution are pure functions with unit tests.

## Develop

```bash
pnpm install
pnpm exec playwright install chromium
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

## Layout

```
core/          parser, schema, locale, theme, style, layout, icons, renderer
themes/        minimal (complete), modern and classic (skeletons with distinct tokens)
locales/       zh-CN, en-US
examples/      Chinese and English Markdown samples
components/    editor, preview, settings, resume document, shadcn/ui
app/api/pdf    Playwright export
```

## Design rules

- Style inheritance: Theme → Locale preset → Document config → Section override → Runtime
- Resume components only read resolved style
- Icons are semantic IDs, not Lucide names
- Section logic uses `section.id`, never the visible title
- A4 is print-first: `210mm × 297mm`, margins in mm, type in pt
