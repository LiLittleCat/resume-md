import { resolveSectionId, splitFrontMatter, splitTitleAndDate } from "@/core/parser";
import type { Resume, ResumeSection, SectionId } from "@/core/schema";

export type OutlineEntry = {
  title: string;
  depth: 1 | 2;
  sectionId: SectionId;
  sectionTitle: string;
};

export type PreviewAnchor =
  | { kind: "header" }
  | { kind: "heading"; title: string; depth: 1 | 2; sectionTitle: string };

export function targetStartsInPage(
  targetTop: number,
  pageTop: number,
  pageBottom: number,
): boolean {
  const tolerance = 1;
  return targetTop >= pageTop - tolerance && targetTop < pageBottom - tolerance;
}

export function isTargetFullyVisible(input: {
  targetTop: number;
  targetBottom: number;
  viewportTop: number;
  viewportBottom: number;
}): boolean {
  return input.targetTop >= input.viewportTop && input.targetBottom <= input.viewportBottom;
}

export function previewTargetTop(input: {
  relativeTop: number;
  pageStart: number;
  viewportTop: number;
  scale: number;
}): number {
  return input.viewportTop + (input.relativeTop - input.pageStart) * input.scale;
}

export function centeredPreviewScrollTop(input: {
  currentScrollTop: number;
  viewportTop: number;
  viewportHeight: number;
  targetTop: number;
  targetHeight: number;
}): number {
  return Math.max(
    0,
    input.currentScrollTop +
      input.targetTop -
      input.viewportTop -
      (input.viewportHeight - input.targetHeight) / 2,
  );
}

export type PreviewClickTarget = {
  sectionId: SectionId | null;
  anchor: PreviewAnchor;
};

export function previewClickTarget(input: {
  inHeader: boolean;
  outlineTitle?: string | null;
  outlineDepth?: string | null;
  sectionId?: string | null;
  sectionTitle?: string | null;
}): PreviewClickTarget | null {
  if (input.outlineTitle && input.outlineDepth && input.sectionId && input.sectionTitle) {
    return {
      sectionId: input.sectionId as SectionId,
      anchor: {
        kind: "heading",
        title: input.outlineTitle,
        depth: input.outlineDepth === "2" ? 2 : 1,
        sectionTitle: input.sectionTitle,
      },
    };
  }
  if (input.inHeader) return { sectionId: null, anchor: { kind: "header" } };
  return null;
}

export function previewAnchorAtOffset(source: string, offset: number): PreviewAnchor {
  const { content } = splitFrontMatter(source);
  const contentStart = source.length - content.length;
  if (offset < contentStart) return { kind: "header" };

  let sectionTitle = "";
  let hasItemHeading = false;
  let anchor: PreviewAnchor = { kind: "header" };
  let index = contentStart;

  for (const rawLine of content.split("\n")) {
    if (index > offset) break;
    const line = rawLine.replace(/\r$/, "");
    const heading = /^(#{1,2})\s+(.+?)\s*$/.exec(line);
    const listItem = /^[-*+]\s+(.+)$/.exec(line);
    if (heading) {
      const depth = heading[1]?.length === 1 ? 1 : 2;
      const rawTitle = heading[2]?.trim() ?? "";
      const visible = stripInlineMarkdown(rawTitle) || rawTitle;
      if (depth === 1 || resolveSectionId(rawTitle) || resolveSectionId(visible)) {
        sectionTitle = visible;
        hasItemHeading = false;
        anchor = { kind: "heading", title: visible, depth: 1, sectionTitle };
      } else if (sectionTitle) {
        hasItemHeading = true;
        const title = splitTitleAndDate(visible).title || visible;
        anchor = { kind: "heading", title, depth: 2, sectionTitle };
      }
    } else if (listItem && sectionTitle && !hasItemHeading) {
      const title =
        splitTitleAndDate(stripInlineMarkdown(listItem[1] ?? "")).title || stripInlineMarkdown(listItem[1] ?? "");
      if (title) {
        anchor = { kind: "heading", title, depth: 2, sectionTitle };
      }
    }
    index += rawLine.length + 1;
  }

  return anchor;
}

export function sourceOffsetForAnchor(source: string, anchor: PreviewAnchor): number {
  if (anchor.kind === "header") {
    if (!source.startsWith("---")) return 0;
    const line = source.indexOf("\n");
    return line === -1 ? 0 : line + 1;
  }

  const { content } = splitFrontMatter(source);
  const contentStart = source.length - content.length;
  let sectionTitle = "";
  let hasItemHeading = false;
  let index = contentStart;
  let fallback = contentStart;

  for (const rawLine of content.split("\n")) {
    const line = rawLine.replace(/\r$/, "");
    const heading = /^(#{1,2})\s+(.+?)\s*$/.exec(line);
    const listItem = /^[-*+]\s+(.+)$/.exec(line);
    if (heading) {
      const depth = heading[1]?.length === 1 ? 1 : 2;
      const rawTitle = heading[2]?.trim() ?? "";
      const visible = stripInlineMarkdown(rawTitle) || rawTitle;
      if (depth === 1 || resolveSectionId(rawTitle) || resolveSectionId(visible)) {
        sectionTitle = visible;
        hasItemHeading = false;
        if (anchorsEqual(anchor, { kind: "heading", title: visible, depth: 1, sectionTitle })) {
          return index;
        }
        if (visible === anchor.sectionTitle) fallback = index;
      } else if (sectionTitle) {
        hasItemHeading = true;
        const title = splitTitleAndDate(visible).title || visible;
        if (anchorsEqual(anchor, { kind: "heading", title, depth: 2, sectionTitle })) {
          return index;
        }
      }
    } else if (listItem && sectionTitle && !hasItemHeading) {
      const title =
        splitTitleAndDate(stripInlineMarkdown(listItem[1] ?? "")).title || stripInlineMarkdown(listItem[1] ?? "");
      if (title && anchorsEqual(anchor, { kind: "heading", title, depth: 2, sectionTitle })) {
        return index;
      }
    }
    index += rawLine.length + 1;
  }

  return fallback;
}

export function sourceSelectionForAnchor(
  source: string,
  anchor: PreviewAnchor,
): { start: number; end: number } {
  const start = sourceOffsetForAnchor(source, anchor);
  const lineEnd = source.indexOf("\n", start);
  const line = source.slice(start, lineEnd === -1 ? source.length : lineEnd);
  if (anchor.kind === "header") {
    return { start, end: lineEnd === -1 ? source.length : lineEnd };
  }
  const titleAt = line.indexOf(anchor.title);
  if (titleAt >= 0) {
    return { start: start + titleAt, end: start + titleAt + anchor.title.length };
  }
  return { start, end: start + line.length };
}

function anchorsEqual(left: PreviewAnchor, right: PreviewAnchor): boolean {
  if (left.kind === "header" || right.kind === "header") return left.kind === right.kind;
  return left.title === right.title && left.depth === right.depth && left.sectionTitle === right.sectionTitle;
}

function stripInlineMarkdown(value: string): string {
  return value
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .trim();
}

export function isOutlineEntrySelected(
  entry: OutlineEntry,
  selection: {
    sectionId: SectionId | null;
    sectionTitle: string | null;
    heading: { title: string; depth: 1 | 2 } | null;
  },
): boolean {
  if (selection.sectionId !== entry.sectionId) return false;
  if (entry.sectionId === "custom" && selection.sectionTitle !== entry.sectionTitle) return false;
  if (!selection.heading) return entry.depth === 1;
  return entry.title === selection.heading.title && entry.depth === selection.heading.depth;
}

export function outlineEntries(resume: Resume): OutlineEntry[] {
  const entries: OutlineEntry[] = [];
  for (const section of resume.sections) {
    entries.push({
      title: section.title,
      depth: 1,
      sectionId: section.id,
      sectionTitle: section.title,
    });
    for (const child of childTitles(section)) {
      entries.push({
        title: child,
        depth: 2,
        sectionId: section.id,
        sectionTitle: section.title,
      });
    }
  }
  return entries;
}

function childTitles(section: ResumeSection): string[] {
  switch (section.id) {
    case "skills":
      return section.groups.map((group) => group.name).filter(Boolean);
    case "experience":
      return section.items.map((item) => item.company);
    case "projects":
      return section.items.map((item) => item.name);
    case "education":
      return section.items.map((item) => item.school);
    case "summary":
      return [];
    default:
      return section.items.map((item) => item.title);
  }
}
