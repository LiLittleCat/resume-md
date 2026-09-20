import type {
  Contact,
  ContentBlock,
  EducationItem,
  ExperienceItem,
  FrontMatter,
  GenericItem,
  InlineSpan,
  LocaleId,
  ParseWarning,
  Profile,
  ProjectBlock,
  ProjectItem,
  Resume,
  ResumeDate,
  ResumeSection,
  SectionId,
  SkillGroup,
} from "../schema";
import { ContactFieldSchema, LocaleIdSchema, ResumeSchema } from "../schema";
import {
  containsDateToken,
  extractTrailingDateRange,
  looksLikeDateRange,
  parseDateRange,
} from "./dates";
import { splitFrontMatter } from "./front-matter";
import {
  extractInlineCode,
  headingInlineSpans,
  headingText,
  isHeading,
  isInlineCodeParagraph,
  isList,
  isParagraph,
  isStrongHeavyParagraph,
  listItemInlineSpans,
  listItemParagraphInlineSpans,
  listItemTexts,
  paragraphInlineSpans,
  paragraphText,
  parseMarkdownTree,
} from "./markdown";
import { resolveSectionId, resolveSubheadingField } from "./section-map";
import type { Heading, List, Paragraph, RootContent } from "mdast";

export interface ParseResumeResult {
  resume: Resume;
  warnings: ParseWarning[];
  frontMatter: FrontMatter;
}

export function parseResumeMarkdown(source: string): ParseResumeResult {
  const warnings: ParseWarning[] = [];
  const { data: frontMatter, content, warnings: fmWarnings } = splitFrontMatter(source);
  warnings.push(...fmWarnings);

  const tree = parseMarkdownTree(content);
  const locale = resolveLocale(frontMatter.locale);
  const profile = buildProfile(frontMatter);
  const groups = groupByH1(tree.children);
  const sections: ResumeSection[] = [];
  const seen = new Set<SectionId>();

  for (const group of groups) {
    let id = resolveSectionId(group.title) ?? "custom";
    if (id !== "custom" && seen.has(id)) {
      id = "custom";
    }
    if (id !== "custom") seen.add(id);
    sections.push(buildSection(id, group.title, group.nodes, warnings));
  }

  const parsed = ResumeSchema.safeParse({
    locale,
    profile,
    sections,
  } satisfies Resume);

  if (!parsed.success) {
    warnings.push({
      code: "resume-schema",
      message: "Parsed resume did not match the Resume schema; keeping best-effort sections.",
    });
    return {
      resume: { locale, profile, sections },
      warnings,
      frontMatter,
    };
  }

  return { resume: parsed.data, warnings, frontMatter };
}

function resolveLocale(value: string | undefined): LocaleId {
  const parsed = LocaleIdSchema.safeParse(value);
  return parsed.success ? parsed.data : "zh-CN";
}

function buildProfile(frontMatter: FrontMatter): Profile {
  const contact: Contact = {};
  if (frontMatter.contact) {
    for (const [key, value] of Object.entries(frontMatter.contact)) {
      const field = ContactFieldSchema.safeParse(key);
      if (field.success && value) {
        contact[field.data] = value;
      }
    }
  }

  return {
    name: frontMatter.name?.trim() ?? "",
    title: frontMatter.title?.trim() || undefined,
    avatar: frontMatter.avatar?.trim() || undefined,
    contact,
  };
}

interface HeadingGroup {
  title: string;
  titleSpans?: InlineSpan[];
  nodes: RootContent[];
}

function groupByH1(nodes: RootContent[]): HeadingGroup[] {
  const groups: HeadingGroup[] = [];
  let current: HeadingGroup | undefined;

  for (const node of nodes) {
    if (isSectionStart(node)) {
      current = { title: headingText(node), nodes: [] };
      groups.push(current);
      continue;
    }
    if (node.type === "thematicBreak" || node.type === "html" || node.type === "yaml") {
      continue;
    }
    if (!current) continue;
    current.nodes.push(node);
  }

  return groups;
}

function isSectionStart(node: RootContent): node is Heading {
  if (isHeading(node, 1)) return true;
  if (!isHeading(node, 2)) return false;
  return resolveSectionId(headingText(node)) !== undefined;
}

function groupByH2(nodes: RootContent[]): HeadingGroup[] {
  const groups: HeadingGroup[] = [];
  let current: HeadingGroup | undefined;
  const prelude: RootContent[] = [];

  for (const node of nodes) {
    if (isHeading(node, 2)) {
      current = {
        title: headingText(node),
        titleSpans: headingInlineSpans(node),
        nodes: [],
      };
      groups.push(current);
      continue;
    }
    if (!current) {
      prelude.push(node);
      continue;
    }
    current.nodes.push(node);
  }

  if (groups.length === 0 && prelude.length > 0) {
    return [{ title: "", nodes: prelude }];
  }

  if (prelude.length > 0 && groups[0]) {
    groups[0].nodes.unshift(...prelude);
  }

  return groups;
}

function buildSection(
  id: SectionId,
  title: string,
  nodes: RootContent[],
  warnings: ParseWarning[],
): ResumeSection {
  switch (id) {
    case "summary":
      return { id, title, content: collectContentBlocks(nodes) };
    case "skills":
      return { id, title, groups: parseSkillGroups(nodes) };
    case "experience":
      return { id, title, items: parseExperienceItems(nodes, warnings) };
    case "projects":
      return { id, title, items: parseProjectItems(nodes, warnings) };
    case "education":
      return { id, title, items: parseEducationItems(nodes) };
    default: {
      const items = parseGenericItems(nodes);
      if (id === "openSource" && items.length === 0) {
        const listed = parseGenericListSection(nodes);
        if (listed.items.length > 0) {
          return {
            id,
            title,
            items: listed.items,
            blocks: listed.blocks,
            itemLayout: "list",
          };
        }
      }
      return { id, title, items, blocks: collectContentBlocks(sectionPrelude(nodes)) };
    }
  }
}

function parseSkillGroups(nodes: RootContent[]): SkillGroup[] {
  const groups = groupByH2(nodes);
  const result: SkillGroup[] = [];

  for (const group of groups) {
    const skills = collectSkills(group.nodes);
    if (skills.items.length === 0 && !group.title) continue;
    result.push({
      name: group.title,
      ...skills,
    });
  }

  return result.filter((group) => group.items.length > 0 || group.name);
}

function collectSkills(nodes: RootContent[]): Omit<SkillGroup, "name"> {
  const contentNodes = nodes.filter((node) => isParagraph(node) || isList(node));
  const onlyNode = contentNodes.length === 1 ? contentNodes[0] : undefined;
  if (onlyNode && isList(onlyNode)) {
    return {
      items: listItemTexts(onlyNode),
      richItems: listItemInlineSpans(onlyNode),
      richItemParagraphs: listItemParagraphInlineSpans(onlyNode),
      listType: onlyNode.ordered ? "ordered" : "unordered",
      listStart: onlyNode.ordered ? (onlyNode.start ?? 1) : undefined,
    };
  }

  const items: string[] = [];
  const richItems: InlineSpan[][] = [];
  for (const node of nodes) {
    if (isParagraph(node)) {
      if (isInlineCodeParagraph(node)) {
        for (const item of extractInlineCode(node)) {
          items.push(item);
          richItems.push([{ text: item }]);
        }
        continue;
      }
      const text = paragraphText(node);
      const parts = splitSkillLine(text);
      for (const part of parts) {
        items.push(part);
        richItems.push(parts.length === 1 ? paragraphInlineSpans(node) : [{ text: part }]);
      }
    } else if (isList(node)) {
      const listItems = listItemTexts(node);
      const listSpans = listItemInlineSpans(node);
      for (const [index, item] of listItems.entries()) {
        const parts = splitSkillLine(item);
        for (const part of parts) {
          items.push(part);
          richItems.push(
            parts.length === 1 ? (listSpans[index] ?? [{ text: part }]) : [{ text: part }],
          );
        }
      }
    }
  }
  const deduplicated = uniqueSkillItems(items, richItems);
  return { items: deduplicated.items, richItems: deduplicated.richItems };
}

function uniqueSkillItems(
  items: string[],
  richItems: InlineSpan[][],
): { items: string[]; richItems: InlineSpan[][] } {
  const seen = new Set<string>();
  const result: string[] = [];
  const richResult: InlineSpan[][] = [];
  items.forEach((item, index) => {
    const key = item.trim();
    if (!key || seen.has(key)) return;
    seen.add(key);
    result.push(key);
    richResult.push(richItems[index] ?? [{ text: key }]);
  });
  return { items: result, richItems: richResult };
}

function splitSkillLine(value: string): string[] {
  if (!value) return [];
  return value
    .split(/\s*(?:\/|、|\||,|，)\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseExperienceItems(nodes: RootContent[], warnings: ParseWarning[]): ExperienceItem[] {
  const groups = groupByH2(nodes).filter((group) => group.title);
  return groups.map((group) => {
    const parsed = parseItemBody(group.nodes);
    const blocks = parseMarkdownBlocks(group.nodes);
    if (!parsed.subtitle && !parsed.startDate) {
      warnings.push({
        code: "experience-meta",
        message: `Experience item "${group.title}" is missing a position or date line.`,
      });
    }
    return {
      company: group.title,
      position: parsed.subtitle,
      metaFields: parsed.metaFields,
      richMetaFields: parsed.richMetaFields,
      startDate: parsed.startDate,
      endDate: parsed.endDate,
      datesStrong: parsed.datesStrong,
      location: parsed.location,
      description: parsed.description,
      descriptionSpans: parsed.descriptionSpans,
      responsibilities: parsed.responsibilities,
      richResponsibilities: parsed.richResponsibilities,
      achievements: parsed.achievements,
      richAchievements: parsed.richAchievements,
      blocks,
    };
  });
}

function parseProjectItems(nodes: RootContent[], warnings: ParseWarning[]): ProjectItem[] {
  const groups = groupByH2(nodes).filter((group) => group.title);
  return groups.map((group) => {
    const parsed = parseItemBody(group.nodes);
    const blocks = parseMarkdownBlocks(group.nodes);
    if (!group.title) {
      warnings.push({
        code: "project-name",
        message: "A project is missing a name heading.",
      });
    }
    return {
      name: group.title,
      role: parsed.subtitle,
      richRole: parsed.richSubtitle,
      startDate: parsed.startDate,
      endDate: parsed.endDate,
      datesStrong: parsed.datesStrong,
      location: parsed.location,
      description: blocks
        .filter((block) => block.type === "paragraph")
        .flatMap((block) => block.items)
        .join("\n") || undefined,
      techStack: unique(
        blocks.filter((block) => block.type === "tags").flatMap((block) => block.items),
      ),
      responsibilities: blocks
        .filter((block) => block.type === "unordered-list" || block.type === "ordered-list")
        .flatMap((block) => block.items),
      blocks,
    };
  });
}

function parseMarkdownBlocks(nodes: RootContent[]): ProjectBlock[] {
  const blocks: ProjectBlock[] = [];
  const metadata: ItemBody = {};
  let pendingHeading: string | undefined;
  let reachedContent = false;

  const addBlock = (block: Omit<ProjectBlock, "heading">) => {
    blocks.push({ ...block, heading: pendingHeading });
    pendingHeading = undefined;
    reachedContent = true;
  };

  for (const node of nodes) {
    if (node.type === "heading" && node.depth >= 3) {
      if (pendingHeading) {
        blocks.push({ heading: pendingHeading, type: "paragraph", items: [] });
      }
      pendingHeading = headingText(node as Heading);
      reachedContent = true;
      continue;
    }

    if (!reachedContent && isParagraph(node)) {
      const text = paragraphText(node);
      if (looksLikeDateRange(text) && !hasPipe(text)) continue;
      if (applyMetaParagraph(node, metadata)) continue;
    }

    if (isParagraph(node)) {
      if (isInlineCodeParagraph(node)) {
        const items = extractInlineCode(node);
        if (items.length > 0) addBlock({ type: "tags", items });
      } else {
        const text = paragraphText(node);
        if (text) addBlock({ type: "paragraph", items: [text], spans: [paragraphInlineSpans(node)] });
      }
      continue;
    }

    if (isList(node)) {
      const items = listItemTexts(node);
      if (items.length > 0) {
        addBlock({
          type: node.ordered ? "ordered-list" : "unordered-list",
          items,
          spans: listItemInlineSpans(node),
          start: node.ordered ? (node.start ?? 1) : undefined,
        });
      }
    }
  }

  if (pendingHeading) {
    blocks.push({ heading: pendingHeading, type: "paragraph", items: [] });
  }

  return blocks;
}

function parseEducationItems(nodes: RootContent[]): EducationItem[] {
  const groups = groupByH2(nodes).filter((group) => group.title);
  return groups.map((group) => {
    const parsed = parseItemBody(group.nodes);
    const { degree, major } = splitDegree(parsed.subtitle);
    return {
      school: group.title,
      degree,
      major,
      richSubtitle: parsed.richSubtitle,
      startDate: parsed.startDate,
      endDate: parsed.endDate,
      datesStrong: parsed.datesStrong,
      location: parsed.location,
      details: parsed.responsibilities ?? parsed.achievements,
      richDetails: parsed.richResponsibilities ?? parsed.richAchievements,
    };
  });
}

function parseGenericItems(nodes: RootContent[]): GenericItem[] {
  const groups = groupByH2(nodes).filter((group) => group.title);
  return groups.map((group) => {
    const heading = splitTitleAndDate(group.title);
    const parsed = parseItemBody(group.nodes);
    const titleSpans = sliceSpansPrefix(group.titleSpans ?? [], heading.title.length);
    return {
      title: heading.title,
      ...(titleSpans ? { titleSpans } : {}),
      subtitle: parsed.subtitle ?? heading.subtitle,
      subtitleSpans: parsed.richSubtitle,
      startDate: parsed.startDate ?? heading.startDate,
      endDate: parsed.endDate ?? heading.endDate,
      datesStrong: parsed.datesStrong,
      description: parsed.description,
      descriptionSpans: parsed.descriptionSpans,
      highlights: parsed.responsibilities ?? parsed.achievements,
      richHighlights: parsed.richResponsibilities ?? parsed.richAchievements,
    };
  });
}

function parseGenericListSection(nodes: RootContent[]): {
  items: GenericItem[];
  blocks: ContentBlock[];
} {
  const items: GenericItem[] = [];
  const leftover: RootContent[] = [];

  for (const node of nodes) {
    if (isList(node) && !node.ordered) {
      items.push(...genericItemsFromList(node));
      continue;
    }
    if (isParagraph(node) && items.length > 0) {
      const last = items.at(-1);
      const text = paragraphText(node);
      const spans = paragraphInlineSpans(node);
      if (last && text) {
        last.description = last.description ? `${last.description}\n${text}` : text;
        last.descriptionSpans = last.descriptionSpans?.length
          ? [...last.descriptionSpans, { text: "\n", break: true }, ...spans]
          : spans;
        continue;
      }
    }
    leftover.push(node);
  }

  return { items, blocks: collectContentBlocks(leftover) };
}

function genericItemsFromList(node: List): GenericItem[] {
  const items: GenericItem[] = [];
  for (const listItem of node.children) {
    const paragraphs: InlineSpan[][] = [];
    const highlights: string[] = [];
    const richHighlights: InlineSpan[][] = [];
    for (const child of listItem.children) {
      if (isParagraph(child)) {
        const spans = paragraphInlineSpans(child);
        if (spans.length > 0) paragraphs.push(spans);
      } else if (isList(child)) {
        highlights.push(...listItemTexts(child));
        richHighlights.push(...listItemInlineSpans(child));
      }
    }

    const first = paragraphs[0] ?? [];
    const { before, after } = splitSpansAtBreak(first);
    const firstText = before.map((span) => span.text).join("");
    const heading = splitTitleAndDate(firstText);
    const title = heading.title || firstText.trim();
    if (!title) continue;

    const restParagraphs = [...(after.length > 0 ? [after] : []), ...paragraphs.slice(1)];
    const description = restParagraphs
      .map((spans) =>
        spans
          .filter((span) => !span.break)
          .map((span) => span.text)
          .join(""),
      )
      .filter(Boolean)
      .join("\n")
      .trim();
    const descriptionSpans =
      restParagraphs.length > 0
        ? restParagraphs.flatMap((spans, index) =>
            index === 0 ? spans : [{ text: "\n", break: true as const }, ...spans],
          )
        : undefined;
    const titleSpans = sliceSpansPrefix(before, heading.title.length || title.length);
    const dateField = splitPipeSpanGroups(before).at(-1);

    items.push({
      title,
      ...(titleSpans ? { titleSpans } : {}),
      ...(heading.subtitle ? { subtitle: heading.subtitle } : {}),
      ...(heading.startDate ? { startDate: heading.startDate } : {}),
      ...(heading.endDate ? { endDate: heading.endDate } : {}),
      ...(heading.startDate && dateField ? { datesStrong: spanGroupStrong(dateField) } : {}),
      ...(description ? { description, descriptionSpans } : {}),
      ...(highlights.length > 0 ? { highlights, richHighlights } : {}),
    });
  }
  return items;
}

function splitSpansAtBreak(spans: InlineSpan[]): { before: InlineSpan[]; after: InlineSpan[] } {
  const index = spans.findIndex((span) => span.break);
  if (index === -1) return { before: spans, after: [] };
  return { before: spans.slice(0, index), after: spans.slice(index + 1) };
}

export function splitTitleAndDate(text: string): {
  title: string;
  subtitle?: string;
  startDate?: ResumeDate;
  endDate?: ResumeDate;
} {
  const trimmed = text.trim();
  if (!trimmed) return { title: "" };

  const parts = splitPipeFields(trimmed);

  if (parts.length >= 2) {
    const fields = [...parts];
    const last = fields.at(-1) ?? "";
    const extracted = looksLikeDateRange(last) ? { before: "", range: last } : extractTrailingDateRange(last);
    if (extracted && looksLikeDateRange(extracted.range)) {
      if (extracted.before) fields[fields.length - 1] = extracted.before;
      else fields.pop();
      const range = parseDateRange(extracted.range);
      return {
        title: fields[0] ?? trimmed,
        subtitle: fields.length > 1 ? fields.slice(1).join(" · ") : undefined,
        startDate: range.start,
        endDate: range.end,
      };
    }
  }

  const trailing = extractTrailingDateRange(trimmed);
  if (trailing) {
    const title = trailing.before.replace(/[|｜]\s*$/, "").trim();
    const range = parseDateRange(trailing.range);
    return { title: title || trimmed, startDate: range.start, endDate: range.end };
  }

  return { title: trimmed };
}

function splitPipeFields(text: string): string[] {
  return text
    .split(/[\|｜]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function hasPipe(text: string): boolean {
  return /[\|｜]/.test(text);
}

function sliceSpansPrefix(spans: InlineSpan[], length: number): InlineSpan[] | undefined {
  if (length <= 0) return undefined;
  const sliced: InlineSpan[] = [];
  let counted = 0;
  for (const span of spans) {
    if (span.break) {
      if (counted >= length) break;
      sliced.push(span);
      continue;
    }
    if (counted >= length) break;
    const take = Math.min(span.text.length, length - counted);
    if (take <= 0) break;
    sliced.push(take === span.text.length ? span : { ...span, text: span.text.slice(0, take) });
    counted += take;
  }
  const normalized = sliced
    .map((span) => (span.break ? span : { ...span, text: span.text.replace(/\s+$/, "") }))
    .filter((span) => span.break || span.text.length > 0);
  return normalized.length > 0 ? normalized : undefined;
}

interface ItemBody {
  subtitle?: string;
  richSubtitle?: InlineSpan[];
  metaFields?: string[];
  richMetaFields?: InlineSpan[][];
  startDate?: ResumeDate;
  endDate?: ResumeDate;
  datesStrong?: boolean;
  location?: string;
  description?: string;
  descriptionSpans?: InlineSpan[];
  techStack?: string[];
  responsibilities?: string[];
  richResponsibilities?: InlineSpan[][];
  achievements?: string[];
  richAchievements?: InlineSpan[][];
}

function parseItemBody(nodes: RootContent[]): ItemBody {
  const body: ItemBody = {};
  const description: string[] = [];
  let field: "responsibilities" | "achievements" | "description" | "techStack" | undefined;
  let consumedMeta = false;

  for (const node of nodes) {
    if (node.type === "heading" && node.depth >= 3) {
      field = resolveSubheadingField(headingText(node as Heading)) ?? "responsibilities";
      continue;
    }

    if (!field && isParagraph(node)) {
      const text = paragraphText(node);
      if (looksLikeDateRange(text) && !hasPipe(text) && !body.startDate) {
        const range = parseDateRange(text);
        body.startDate = range.start;
        body.endDate = range.end;
        body.datesStrong = spanGroupStrong(paragraphInlineSpans(node));
        continue;
      }
      if (!consumedMeta) {
        const applied = applyMetaParagraph(node, body);
        if (applied) {
          consumedMeta = body.subtitle !== undefined || body.startDate !== undefined;
          continue;
        }
      }
    }

    if (isParagraph(node) && isInlineCodeParagraph(node)) {
      const codes = extractInlineCode(node);
      body.techStack = unique([...(body.techStack ?? []), ...codes]);
      continue;
    }

    if (isList(node)) {
      const items = listItemTexts(node);
      const richItems = listItemInlineSpans(node);
      if (field === "achievements") {
        body.achievements = [...(body.achievements ?? []), ...items];
        body.richAchievements = [...(body.richAchievements ?? []), ...richItems];
      } else if (field === "techStack") {
        body.techStack = unique([...(body.techStack ?? []), ...items.flatMap(splitSkillLine)]);
      } else {
        body.responsibilities = [...(body.responsibilities ?? []), ...items];
        body.richResponsibilities = [...(body.richResponsibilities ?? []), ...richItems];
      }
      continue;
    }

    if (isParagraph(node)) {
      const text = paragraphText(node);
      if (!text) continue;
      const spans = paragraphInlineSpans(node);
      if (field === "description") {
        description.push(text);
        body.descriptionSpans = appendInlineSpans(body.descriptionSpans, spans);
      } else if (field === "techStack") {
        body.techStack = unique([
          ...(body.techStack ?? []),
          ...(isInlineCodeParagraph(node) ? extractInlineCode(node) : splitSkillLine(text)),
        ]);
      } else if (field === "achievements") {
        body.achievements = [...(body.achievements ?? []), text];
        body.richAchievements = [...(body.richAchievements ?? []), spans];
      } else if (field === "responsibilities") {
        body.responsibilities = [...(body.responsibilities ?? []), text];
        body.richResponsibilities = [...(body.richResponsibilities ?? []), spans];
      } else {
        description.push(text);
        body.descriptionSpans = appendInlineSpans(body.descriptionSpans, spans);
      }
    }
  }

  if (description.length > 0) {
    body.description = description.join("\n");
  }

  return body;
}

function appendInlineSpans(
  current: InlineSpan[] | undefined,
  next: InlineSpan[],
): InlineSpan[] {
  return current && current.length > 0 ? [...current, { text: " " }, ...next] : next;
}

function applyMetaParagraph(node: Paragraph, body: ItemBody): boolean {
  const text = paragraphText(node);
  if (!text) return false;

  if (looksLikeDateRange(text) && !hasPipe(text)) {
    const range = parseDateRange(text);
    body.startDate = range.start;
    body.endDate = range.end;
    body.datesStrong = spanGroupStrong(paragraphInlineSpans(node));
    return true;
  }

  if (hasPipe(text) || containsDateToken(text) || isStrongHeavyParagraph(node)) {
    const groups = splitPipeSpanGroups(paragraphInlineSpans(node));
    const fields: string[] = [];
    const fieldSpans: InlineSpan[][] = [];
    const trailingFields: string[] = [];
    let foundDate = false;

    for (const group of groups) {
      const part = spanGroupText(group);
      const extracted = !body.startDate ? extractTrailingDateRange(part) : undefined;
      if (extracted && looksLikeDateRange(extracted.range)) {
        if (extracted.before) {
          fields.push(extracted.before);
          fieldSpans.push(sliceSpansPrefix(group, extracted.before.length) ?? [{ text: extracted.before }]);
        }
        const range = parseDateRange(extracted.range);
        body.startDate = range.start;
        body.endDate = range.end;
        body.datesStrong = spanGroupStrong(group);
        foundDate = true;
        continue;
      }

      if (foundDate || body.startDate) trailingFields.push(part);
      else {
        fields.push(part);
        fieldSpans.push(group);
      }
    }

    if (foundDate || body.startDate) {
      if (fields.length > 0) {
        body.metaFields = fields;
        body.richMetaFields = fieldSpans;
        body.subtitle = fields.at(-1);
        body.richSubtitle = fieldSpans.at(-1);
      }
      if (trailingFields.length > 0) body.location = trailingFields.join(" · ");
    } else if (fields.length > 0) {
      body.metaFields = [fields[0]!];
      body.richMetaFields = fieldSpans.slice(0, 1);
      body.subtitle = fields[0];
      body.richSubtitle = fieldSpans[0];
      if (fields.length > 1) body.location = fields.slice(1).join(" · ");
    }
    return true;
  }

  return false;
}

function splitPipeSpanGroups(spans: InlineSpan[]): InlineSpan[][] {
  const groups: InlineSpan[][] = [];
  let current: InlineSpan[] = [];

  const pushCurrent = () => {
    const trimmed = trimSpanGroup(current);
    if (trimmed.length > 0) groups.push(trimmed);
    current = [];
  };

  for (const span of spans) {
    if (span.break) {
      current.push(span);
      continue;
    }
    const chunks = span.text.split(/([|｜]+)/);
    for (const chunk of chunks) {
      if (/^[|｜]+$/.test(chunk)) {
        pushCurrent();
        continue;
      }
      if (!chunk) continue;
      current.push({ ...span, text: chunk });
    }
  }
  pushCurrent();
  return groups;
}

function trimSpanGroup(spans: InlineSpan[]): InlineSpan[] {
  const next = spans
    .map((span) => (span.break ? span : { ...span, text: span.text.replace(/\s+/g, " ") }))
    .filter((span) => span.break || span.text.length > 0);
  if (next[0] && !next[0].break) next[0] = { ...next[0], text: next[0].text.trimStart() };
  const last = next.at(-1);
  if (last && !last.break) next[next.length - 1] = { ...last, text: last.text.trimEnd() };
  return next.filter((span) => span.break || span.text.length > 0);
}

function spanGroupText(spans: InlineSpan[]): string {
  return spans
    .filter((span) => !span.break)
    .map((span) => span.text)
    .join("")
    .trim();
}

function spanGroupStrong(spans: InlineSpan[]): boolean {
  const textSpans = spans.filter((span) => !span.break && span.text.trim());
  return textSpans.length > 0 && textSpans.every((span) => span.strong);
}

function splitDegree(value: string | undefined): { degree?: string; major?: string } {
  if (!value) return {};
  const parts = value
    .split(/\s*[·•/|]\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    return { major: parts[0], degree: parts.slice(1).join(" · ") };
  }
  return { degree: value };
}

function collectContentBlocks(nodes: RootContent[]): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  for (const node of nodes) {
    if (isParagraph(node)) {
      const text = paragraphText(node);
      if (!text) continue;
      blocks.push({
        type: "paragraph",
        items: [text],
        spans: [paragraphInlineSpans(node)],
      });
      continue;
    }
    if (isList(node)) {
      const items = listItemTexts(node);
      if (items.length === 0) continue;
      blocks.push({
        type: node.ordered ? "ordered-list" : "unordered-list",
        items,
        spans: listItemInlineSpans(node),
        ...(node.ordered ? { start: node.start ?? 1 } : {}),
      });
    }
  }
  return blocks;
}

function sectionPrelude(nodes: RootContent[]): RootContent[] {
  const prelude: RootContent[] = [];
  for (const node of nodes) {
    if (isHeading(node, 2)) break;
    prelude.push(node);
  }
  return prelude;
}

function unique(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const key = value.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(key);
  }
  return result;
}
