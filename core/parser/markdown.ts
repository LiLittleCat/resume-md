import { toString } from "mdast-util-to-string";
import type {
  Heading,
  List,
  ListItem,
  Paragraph,
  PhrasingContent,
  Root,
  RootContent,
} from "mdast";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import type { InlineSpan } from "../schema";

const processor = unified().use(remarkParse).use(remarkGfm);

export function parseMarkdownTree(markdown: string): Root {
  return processor.parse(markdown) as Root;
}

export function headingText(node: Heading): string {
  return toString(node).trim();
}

export function paragraphText(node: Paragraph): string {
  return phrasingToText(node.children).trim();
}

export function paragraphInlineSpans(node: Paragraph): InlineSpan[] {
  return normalizeInlineSpans(phrasingToInlineSpans(node.children));
}

function phrasingToInlineSpans(
  nodes: PhrasingContent[],
  strong = false,
  href?: string,
): InlineSpan[] {
  return nodes.flatMap((node): InlineSpan[] => {
    switch (node.type) {
      case "text":
        return textNodeSpans(node.value, strong, href);
      case "strong":
        return phrasingToInlineSpans(node.children, true, href);
      case "emphasis":
      case "delete":
        return phrasingToInlineSpans(node.children, strong, href);
      case "inlineCode":
        return [inlineSpan(node.value, strong, href)];
      case "link":
        return phrasingToInlineSpans(node.children, strong, safeMarkdownHref(node.url));
      case "break":
        return [breakSpan()];
      default:
        return [inlineSpan(toString(node), strong, href)];
    }
  });
}

function textNodeSpans(value: string, strong: boolean, href?: string): InlineSpan[] {
  const parts = value.split("\n");
  return parts.flatMap((part, index) => {
    const spans: InlineSpan[] = [];
    if (index > 0) spans.push(breakSpan());
    if (part) spans.push(inlineSpan(part, strong, href));
    return spans;
  });
}

function inlineSpan(text: string, strong: boolean, href?: string): InlineSpan {
  return {
    text,
    ...(strong ? { strong: true } : {}),
    ...(href ? { href } : {}),
  };
}

function breakSpan(): InlineSpan {
  return { text: "\n", break: true };
}

function safeMarkdownHref(value: string): string | undefined {
  const href = value.trim();
  if (!href) return undefined;
  const scheme = href.match(/^([a-z][a-z0-9+.-]*):/i)?.[1]?.toLowerCase();
  if (scheme && !["http", "https", "mailto", "tel"].includes(scheme)) return undefined;
  return href;
}

function normalizeInlineSpans(spans: InlineSpan[]): InlineSpan[] {
  const normalized: InlineSpan[] = [];
  for (const span of spans) {
    if (span.break) {
      if (normalized.at(-1)?.break) continue;
      normalized.push({ text: "\n", break: true });
      continue;
    }
    const text = span.text.replace(/\s+/g, " ");
    if (!text) continue;
    const previous = normalized[normalized.length - 1];
    if (
      previous &&
      !previous.break &&
      previous.strong === span.strong &&
      previous.href === span.href
    ) {
      previous.text += text;
    } else {
      normalized.push({ ...span, text });
    }
  }
  while (normalized[0]?.break) normalized.shift();
  while (normalized.at(-1)?.break) normalized.pop();
  if (normalized[0] && !normalized[0].break) {
    normalized[0].text = normalized[0].text.trimStart();
  }
  const last = normalized.at(-1);
  if (last && !last.break) last.text = last.text.trimEnd();
  return normalized.filter((span) => span.break || span.text.length > 0);
}

export function phrasingToText(nodes: PhrasingContent[]): string {
  return nodes
    .map((node) => {
      switch (node.type) {
        case "text":
          return node.value;
        case "strong":
        case "emphasis":
        case "delete":
          return phrasingToText(node.children);
        case "inlineCode":
          return node.value;
        case "link":
          return phrasingToText(node.children) || node.url;
        case "break":
          return " ";
        default:
          return toString(node);
      }
    })
    .join("")
    .replace(/\s+/g, " ");
}

export function extractInlineCode(node: Paragraph): string[] {
  const values: string[] = [];
  for (const child of node.children) {
    if (child.type === "inlineCode" && child.value.trim()) {
      values.push(child.value.trim());
    }
  }
  return values;
}

export function isInlineCodeParagraph(node: Paragraph): boolean {
  const codes = extractInlineCode(node);
  if (codes.length === 0) return false;
  return node.children.every((child) => {
    if (child.type === "inlineCode") return true;
    if (child.type === "break") return true;
    if (child.type === "text") return isInlineCodeSeparator(child.value);
    return false;
  });
}

function isInlineCodeSeparator(value: string): boolean {
  return /^[\s、,，|/·•]*$/.test(value);
}

export function isStrongHeavyParagraph(node: Paragraph): boolean {
  const strong = node.children.filter((child) => child.type === "strong");
  const text = paragraphText(node);
  if (strong.length === 0 || !text) return false;
  const strongText = strong.map((child) => toString(child).trim()).join("");
  return strongText.length >= Math.max(1, text.replace(/[|/·•-]/g, "").trim().length * 0.6);
}

export function listItemTexts(node: List): string[] {
  return node.children
    .map((item) => listItemText(item))
    .filter((text) => text.length > 0);
}

export function listItemInlineSpans(node: List): InlineSpan[][] {
  return node.children.map((item) => {
    const spans: InlineSpan[] = [];
    for (const child of item.children) {
      if (child.type === "paragraph") {
        if (spans.length > 0) spans.push({ text: "\n", break: true });
        spans.push(...paragraphInlineSpans(child));
      } else if (child.type === "list") {
        const nested = listItemTexts(child).join(" ");
        if (nested) spans.push({ text: `${spans.length > 0 ? " " : ""}${nested}` });
      }
    }
    return normalizeInlineSpans(spans);
  });
}

export function listItemParagraphInlineSpans(node: List): InlineSpan[][][] {
  return node.children.map((item) => {
    const paragraphs: InlineSpan[][] = [];
    for (const child of item.children) {
      if (child.type === "paragraph") {
        const spans = paragraphInlineSpans(child);
        if (spans.length > 0) paragraphs.push(spans);
      } else if (child.type === "list") {
        const nested = listItemTexts(child).join(" ");
        if (nested) paragraphs.push([{ text: nested }]);
      }
    }
    return paragraphs;
  });
}

export function listItemText(item: ListItem): string {
  const parts: string[] = [];
  for (const child of item.children) {
    if (child.type === "paragraph") {
      parts.push(paragraphText(child));
    } else if (child.type === "list") {
      parts.push(...listItemTexts(child));
    }
  }
  return parts.join(" ").trim();
}

export function isHeading(node: RootContent, depth: number): node is Heading {
  return node.type === "heading" && node.depth === depth;
}

export function isParagraph(node: RootContent): node is Paragraph {
  return node.type === "paragraph";
}

export function isList(node: RootContent): node is List {
  return node.type === "list";
}
