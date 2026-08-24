import type {
  Contact,
  EducationItem,
  ExperienceItem,
  FrontMatter,
  GenericItem,
  LocaleId,
  ParseWarning,
  Profile,
  ProjectItem,
  Resume,
  ResumeDate,
  ResumeSection,
  SectionId,
  SkillGroup,
} from "../schema";
import { ContactFieldSchema, LocaleIdSchema, ResumeSchema } from "../schema";
import { containsDateToken, looksLikeDateRange, parseDateRange } from "./dates";
import { splitFrontMatter } from "./front-matter";
import {
  extractInlineCode,
  headingText,
  isHeading,
  isInlineCodeParagraph,
  isList,
  isParagraph,
  isStrongHeavyParagraph,
  listItemTexts,
  paragraphText,
  parseMarkdownTree,
} from "./markdown";
import { resolveSectionId, resolveSubheadingField } from "./section-map";
import type { Heading, Paragraph, RootContent } from "mdast";

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
  nodes: RootContent[];
}

function groupByH1(nodes: RootContent[]): HeadingGroup[] {
  const groups: HeadingGroup[] = [];
  let current: HeadingGroup | undefined;

  for (const node of nodes) {
    if (isHeading(node, 1)) {
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

function groupByH2(nodes: RootContent[]): HeadingGroup[] {
  const groups: HeadingGroup[] = [];
  let current: HeadingGroup | undefined;
  const prelude: RootContent[] = [];

  for (const node of nodes) {
    if (isHeading(node, 2)) {
      current = { title: headingText(node), nodes: [] };
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
      return { id, title, content: collectParagraphs(nodes) };
    case "skills":
      return { id, title, groups: parseSkillGroups(nodes) };
    case "experience":
      return { id, title, items: parseExperienceItems(nodes, warnings) };
    case "projects":
      return { id, title, items: parseProjectItems(nodes, warnings) };
    case "education":
      return { id, title, items: parseEducationItems(nodes) };
    default:
      return { id, title, items: parseGenericItems(nodes), blocks: collectParagraphs(nodes) };
  }
}

function parseSkillGroups(nodes: RootContent[]): SkillGroup[] {
  const groups = groupByH2(nodes);
  const result: SkillGroup[] = [];

  for (const group of groups) {
    const items = collectSkills(group.nodes);
    if (items.length === 0 && !group.title) continue;
    result.push({
      name: group.title,
      items: items.length > 0 ? items : [],
    });
  }

  return result.filter((group) => group.items.length > 0 || group.name);
}

function collectSkills(nodes: RootContent[]): string[] {
  const items: string[] = [];
  for (const node of nodes) {
    if (isParagraph(node)) {
      if (isInlineCodeParagraph(node)) {
        items.push(...extractInlineCode(node));
        continue;
      }
      items.push(...splitSkillLine(paragraphText(node)));
    } else if (isList(node)) {
      for (const item of listItemTexts(node)) {
        items.push(...splitSkillLine(item));
      }
    }
  }
  return unique(items);
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
    if (!parsed.subtitle && !parsed.startDate) {
      warnings.push({
        code: "experience-meta",
        message: `Experience item "${group.title}" is missing a position or date line.`,
      });
    }
    return {
      company: group.title,
      position: parsed.subtitle,
      startDate: parsed.startDate,
      endDate: parsed.endDate,
      location: parsed.location,
      description: parsed.description,
      responsibilities: parsed.responsibilities,
      achievements: parsed.achievements,
    };
  });
}

function parseProjectItems(nodes: RootContent[], warnings: ParseWarning[]): ProjectItem[] {
  const groups = groupByH2(nodes).filter((group) => group.title);
  return groups.map((group) => {
    const parsed = parseItemBody(group.nodes);
    if (!group.title) {
      warnings.push({
        code: "project-name",
        message: "A project is missing a name heading.",
      });
    }
    return {
      name: group.title,
      role: parsed.subtitle,
      startDate: parsed.startDate,
      endDate: parsed.endDate,
      location: parsed.location,
      description: parsed.description,
      techStack: parsed.techStack,
      responsibilities: parsed.responsibilities,
      achievements: parsed.achievements,
    };
  });
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
      startDate: parsed.startDate,
      endDate: parsed.endDate,
      location: parsed.location,
      details: parsed.responsibilities ?? parsed.achievements,
    };
  });
}

function parseGenericItems(nodes: RootContent[]): GenericItem[] {
  const groups = groupByH2(nodes).filter((group) => group.title);
  return groups.map((group) => {
    const parsed = parseItemBody(group.nodes);
    return {
      title: group.title,
      subtitle: parsed.subtitle,
      startDate: parsed.startDate,
      endDate: parsed.endDate,
      description: parsed.description,
      highlights: parsed.responsibilities ?? parsed.achievements,
    };
  });
}

interface ItemBody {
  subtitle?: string;
  startDate?: ResumeDate;
  endDate?: ResumeDate;
  location?: string;
  description?: string;
  techStack?: string[];
  responsibilities?: string[];
  achievements?: string[];
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
      if (looksLikeDateRange(text) && !text.includes("|") && !body.startDate) {
        const range = parseDateRange(text);
        body.startDate = range.start;
        body.endDate = range.end;
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
      if (field === "achievements") {
        body.achievements = [...(body.achievements ?? []), ...items];
      } else if (field === "techStack") {
        body.techStack = unique([...(body.techStack ?? []), ...items.flatMap(splitSkillLine)]);
      } else {
        body.responsibilities = [...(body.responsibilities ?? []), ...items];
      }
      continue;
    }

    if (isParagraph(node)) {
      const text = paragraphText(node);
      if (!text) continue;
      if (field === "description") {
        description.push(text);
      } else if (field === "techStack") {
        body.techStack = unique([
          ...(body.techStack ?? []),
          ...(isInlineCodeParagraph(node) ? extractInlineCode(node) : splitSkillLine(text)),
        ]);
      } else if (field === "achievements") {
        body.achievements = [...(body.achievements ?? []), text];
      } else if (field === "responsibilities") {
        body.responsibilities = [...(body.responsibilities ?? []), text];
      } else {
        description.push(text);
      }
    }
  }

  if (description.length > 0) {
    body.description = description.join("\n");
  }

  return body;
}

function applyMetaParagraph(node: Paragraph, body: ItemBody): boolean {
  const text = paragraphText(node);
  if (!text) return false;

  if (looksLikeDateRange(text) && !text.includes("|")) {
    const range = parseDateRange(text);
    body.startDate = range.start;
    body.endDate = range.end;
    return true;
  }

  if (text.includes("|") || containsDateToken(text) || isStrongHeavyParagraph(node)) {
    const parts = text
      .split("|")
      .map((part) => part.trim())
      .filter(Boolean);

    for (const part of parts) {
      if (looksLikeDateRange(part) && !body.startDate) {
        const range = parseDateRange(part);
        body.startDate = range.start;
        body.endDate = range.end;
        continue;
      }
      if (!body.subtitle) {
        body.subtitle = part;
        continue;
      }
      if (!body.location) {
        body.location = part;
      }
    }
    return true;
  }

  return false;
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

function collectParagraphs(nodes: RootContent[]): string[] {
  const blocks: string[] = [];
  for (const node of nodes) {
    if (isParagraph(node)) {
      const text = paragraphText(node);
      if (text) blocks.push(text);
    } else if (isList(node)) {
      blocks.push(...listItemTexts(node));
    }
  }
  return blocks;
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
