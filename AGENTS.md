<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Resume MD

- Keep `core/` free of React, Next.js, and DOM APIs.
- Resume components read `ResolvedDocumentStyle` only. Do not inherit theme/locale/config inside UI.
- Section identity is `section.id`, never the visible heading text.
- Persist semantic icon ids (`briefcase`), never Lucide component names.
- Resume document CSS uses physical units (`pt`, `mm`). Product chrome uses Tailwind.
- Verify with `pnpm test && pnpm typecheck && pnpm lint && pnpm build`.
