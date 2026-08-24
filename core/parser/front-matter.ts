import { parse as parseYaml, parseDocument } from "yaml";
import { FrontMatterSchema, type FrontMatter, type ParseWarning } from "../schema";

const FRONT_MATTER_RE = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;

export interface SplitFrontMatterResult {
  data: FrontMatter;
  content: string;
  warnings: ParseWarning[];
}

export function splitFrontMatter(source: string): SplitFrontMatterResult {
  const warnings: ParseWarning[] = [];
  const match = FRONT_MATTER_RE.exec(source);

  if (!match) {
    return { data: {}, content: source, warnings };
  }

  const raw = match[1] ?? "";
  const content = source.slice(match[0].length);
  let parsed: unknown;

  try {
    parsed = parseYaml(raw) ?? {};
  } catch {
    warnings.push({
      code: "front-matter-yaml",
      message: "Front matter YAML could not be parsed.",
    });
    return { data: {}, content, warnings };
  }

  const result = FrontMatterSchema.safeParse(parsed);
  if (!result.success) {
    warnings.push({
      code: "front-matter-schema",
      message: "Front matter did not match the expected document fields.",
    });
    return { data: {}, content, warnings };
  }

  return { data: result.data, content, warnings };
}

export function setFrontMatterAvatar(source: string, avatar: string | null): string {
  const match = FRONT_MATTER_RE.exec(source);
  if (!match) {
    if (!avatar) return source;
    return `---\navatar: ${JSON.stringify(avatar)}\n---\n\n${source.replace(/^\n+/, "")}`;
  }

  const raw = match[1] ?? "";
  const body = source.slice(match[0].length);
  const document = parseDocument(raw);
  if (document.errors.length > 0) return source;

  if (avatar) document.set("avatar", avatar);
  else document.delete("avatar");

  const dumped = document.toString({ lineWidth: 0 }).replace(/\n+$/, "");
  if (!dumped) return body.replace(/^\n+/, "");
  return `---\n${dumped}\n---\n${body.replace(/^\n/, "")}`;
}
