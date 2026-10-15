import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { DesignConfigSchema, type DesignConfig, type ParseWarning } from "../schema";

/**
 * Editor-managed design settings live in an HTML comment at the very top of the
 * Markdown, apart from everything the user writes. The editor hides it behind a collapsed
 * strip; copying the whole document carries it along, and other renderers hide it.
 *
 *   <!-- resume-md:design <note>
 *   theme: kami
 *   -->
 *
 *   ---
 *   name: …
 *   ---
 */
const DESIGN_MARKER = "resume-md:design";
const DESIGN_BLOCK_RE = /<!--[ \t]*resume-md:design\b[^\n]*\n([\s\S]*?)-->/;

/** Removes the design block (and the blank lines that set it off) from the source. */
export function stripDesignBlock(source: string): string {
  const match = DESIGN_BLOCK_RE.exec(source);
  if (!match) return source;
  const before = source.slice(0, match.index).replace(/\n+$/, "\n");
  const after = source.slice(match.index + match[0].length);
  if (before.trim() === "") return after.replace(/^\s+/, "");
  return before + after.replace(/^[ \t]*\n?/, "");
}

/**
 * Reads the design block. Returns `{}` when there is none, and `null` when it cannot be
 * read, so callers can keep their last good value.
 */
export function readDesignBlock(source: string, warnings: ParseWarning[] = []): DesignConfig | null {
  const match = DESIGN_BLOCK_RE.exec(source);
  if (!match) return {};
  let parsed: unknown;
  try {
    parsed = parseYaml(match[1] ?? "") ?? {};
  } catch {
    parsed = undefined;
  }
  const result = DesignConfigSchema.safeParse(parsed);
  if (result.success) return result.data;
  warnings.push({
    code: "design-block",
    message: "Design settings in the document were invalid and have been ignored.",
  });
  return null;
}

/** True when the source carries a design block anywhere. */
export function hasDesignBlock(source: string): boolean {
  return DESIGN_BLOCK_RE.test(source);
}

/**
 * Writes design overrides into the design block at the top of the source, moving an
 * existing block there and keeping its note. An empty design removes the block.
 */
export function setDesignBlock(
  source: string,
  design: DesignConfig,
  options: { comment?: string } = {},
): string {
  const match = DESIGN_BLOCK_RE.exec(source);
  const rest = stripDesignBlock(source);
  if (Object.keys(design).length === 0) return rest;

  const note = options.comment ? ` ${options.comment}` : "";
  const opening = match
    ? match[0].slice(0, match[0].indexOf("\n") + 1)
    : `<!-- ${DESIGN_MARKER}${note}\n`;
  const block = `${opening}${stringifyYaml(design, { lineWidth: 0 })}-->\n`;

  const body = rest.replace(/^\s+/, "");
  return body ? `${block}\n${body}` : block;
}
