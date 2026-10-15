import { hasDesignBlock, readDesignBlock, setDesignBlock, stripDesignBlock } from "@/core/parser";
import type { DesignConfig, ResumeConfig } from "@/core/schema";
import { isPlainObject } from "@/core/style/merge";
import { getUiCopy } from "@/locales/ui";

/**
 * A saved or copied document carries its design settings in a comment block at the top,
 * so copying the Markdown carries them along. The editor works on the text without that
 * block (`source`) and keeps the design in `config`, plus the app-level locale.
 */

export function designOf(config: ResumeConfig): DesignConfig {
  const design: Record<string, unknown> = { ...config };
  delete design.locale;
  return pruneEmpty(design) as DesignConfig;
}

export function withLocale(design: DesignConfig, locale: ResumeConfig["locale"]): ResumeConfig {
  return locale ? { locale, ...design } : { ...design };
}

/** The full document: editor text with the design block on top. */
export function composeDocument(source: string, config: ResumeConfig): string {
  return setDesignBlock(source, designOf(config), {
    comment: getUiCopy(config.locale).designBlockComment,
  });
}

/** The design block as it appears at the top of the full document, or "" without one. */
export function designBlockText(config: ResumeConfig): string {
  return composeDocument("", config).trimEnd();
}

/**
 * Splits pasted or loaded text into editor text and config. A readable design block
 * replaces the design; an unreadable one stays in the text so it can be fixed.
 */
export function splitDocument(
  document: string,
  previous: ResumeConfig,
): { source: string; config: ResumeConfig } {
  if (!hasDesignBlock(document)) return { source: document, config: previous };
  const design = readDesignBlock(document);
  if (design === null) return { source: document, config: previous };
  return { source: stripDesignBlock(document), config: withLocale(design, previous.locale) };
}

/** Values older libraries stored as explicit config although they are the defaults. */
const LEGACY_DEFAULTS: Partial<Record<keyof DesignConfig, unknown>> = {
  theme: "minimal",
  spacingPreset: "normal",
};

/**
 * Opens a stored document: a design block in the source wins; otherwise design overrides
 * kept only in the legacy stored config are used, minus values that were old defaults.
 */
export function syncDocumentDesign(
  document: string,
  config: ResumeConfig,
): { source: string; config: ResumeConfig } {
  if (hasDesignBlock(document)) {
    const split = splitDocument(document, { locale: config.locale });
    if (split.source !== document) return split;
  }

  const legacy = designOf(config) as Record<string, unknown>;
  for (const [key, value] of Object.entries(LEGACY_DEFAULTS)) {
    if (legacy[key] === value) delete legacy[key];
  }
  return { source: document, config: withLocale(legacy as DesignConfig, config.locale) };
}

function pruneEmpty(value: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (item === undefined) continue;
    if (isPlainObject(item)) {
      const child = pruneEmpty(item);
      if (Object.keys(child).length > 0) result[key] = child;
      continue;
    }
    result[key] = item;
  }
  return result;
}
