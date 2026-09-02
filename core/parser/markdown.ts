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

function phrasingToInlineSpans(nodes: PhrasingContent[], strong = false): InlineSpan[] {
  return nodes.flatMap((node): InlineSpan[] => {
    switch (node.type) {
      case "text":
        return [{ text: node.value, strong: strong || undefined }];
      case "strong":
        return phrasingToInlineSpans(node.children, true);
      case "emphasis":
      case "delete":
        return phrasingToInlineSpans(node.children, strong);
      case "inlineCode":
        return [{ text: node.value, strong: strong || undefined }];
      case "link":
        return phrasingToInlineSpans(node.children, strong);
      case "break":
        return [{ text: " ", strong: strong || undefined }];
      default:
        return [{ text: toString(node), strong: strong || undefined }];
    }
  });
}

function normalizeInlineSpans(spans: InlineSpan[]): InlineSpan[] {
  const normalized: InlineSpan[] = [];
  for (const span of spans) {
    const text = span.text.replace(/\s+/g, " ");
    if (!text) continue;
    const previous = normalized[normalized.length - 1];
    if (previous && previous.strong === span.strong) {
      previous.text += text;
    } else {
      normalized.push({ ...span, text });
    }
  }
  if (normalized[0]) normalized[0].text = normalized[0].text.trimStart();
  if (normalized.at(-1)) normalized.at(-1)!.text = normalized.at(-1)!.text.trimEnd();
  return normalized.filter((span) => span.text.length > 0);
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
  const leftover = node.children.filter((child) => {
    if (child.type === "inlineCode") return false;
    if (child.type === "text") return child.value.trim().length > 0;
    if (child.type === "break") return false;
    return true;
  });
  return leftover.length === 0;
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
        if (spans.length > 0) spans.push({ text: " " });
        spans.push(...paragraphInlineSpans(child));
      } else if (child.type === "list") {
        const nested = listItemTexts(child).join(" ");
        if (nested) spans.push({ text: `${spans.length > 0 ? " " : ""}${nested}` });
      }
    }
    return normalizeInlineSpans(spans);
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
