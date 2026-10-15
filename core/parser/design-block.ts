import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { DesignConfigSchema, type DesignConfig, type ParseWarning } from "../schema";

/**
 * Editor-managed design settings live in an HTML comment at the end of the Markdown,
 * apart from everything the user writes. Copying the Markdown carries the design along,
 * and other Markdown renderers hide it.
 *
 *   <!-- resume-md:design <note>
 *   theme: kami
 *   -->
 */
const DESIGN_MARKER = "resume-md:design";
const DESIGN_BLOCK_RE = /<!--[ \t]*resume-md:design\b[^\n]*\n([\s\S]*?)-->/;

/** Removes the design block (and the blank lines that set it off) from the source. */
export function stripDesignBlock(source: string): string {
  const match = DESIGN_BLOCK_RE.exec(source);
  if (!match) return source;
  const before = source.slice(0, match.index).replace(/\n+$/, "\n");
  const after = source.slice(match.index + match[0].length).replace(/^[ \t]*\n?/, "");
  return before + after;
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
    message: "Design settings at the end of the document were invalid and have been ignored.",
  });
  return null;
}

/**
 * Writes design overrides into the trailing design block, replacing an existing block in
 * place. An empty design removes the block.
 */
export function setDesignBlock(
  source: string,
  design: DesignConfig,
  options: { comment?: string } = {},
): string {
  if (Object.keys(design).length === 0) return stripDesignBlock(source);

  const yaml = stringifyYaml(design, { lineWidth: 0 });
  const match = DESIGN_BLOCK_RE.exec(source);
  if (match) {
    const opening = match[0].slice(0, match[0].indexOf("\n") + 1);
    return (
      source.slice(0, match.index) +
      `${opening}${yaml}-->` +
      source.slice(match.index + match[0].length)
    );
  }

  const note = options.comment ? ` ${options.comment}` : "";
  const block = `<!-- ${DESIGN_MARKER}${note}\n${yaml}-->\n`;
  const body = source.replace(/\s+$/, "");
  return body ? `${body}\n\n${block}` : block;
}
