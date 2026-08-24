import { parse as parseYaml } from "yaml";
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
