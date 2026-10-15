import { readDesignBlock, setDesignBlock } from "@/core/parser";
import type { DesignConfig, ResumeConfig } from "@/core/schema";
import { isPlainObject } from "@/core/style/merge";
import { getUiCopy } from "@/locales/ui";

/**
 * The Markdown source is the source of truth for design settings: they live in the
 * trailing design comment block so copying the Markdown carries them along. The editor's
 * `config` is that block plus the app-level locale.
 */

export function designOf(config: ResumeConfig): DesignConfig {
  const design: Record<string, unknown> = { ...config };
  delete design.locale;
  return pruneEmpty(design) as DesignConfig;
}

export function withLocale(design: DesignConfig, locale: ResumeConfig["locale"]): ResumeConfig {
  return locale ? { locale, ...design } : { ...design };
}

/** Rebuilds the editor config from the source, keeping `previous` when the block is unreadable. */
export function configFromSource(source: string, previous: ResumeConfig): ResumeConfig {
  const design = readDesignBlock(source);
  if (design === null) return previous;
  return withLocale(design, previous.locale);
}

export function writeDesign(source: string, config: ResumeConfig): string {
  return setDesignBlock(source, designOf(config), {
    comment: getUiCopy(config.locale).designBlockComment,
  });
}

/** Values older libraries stored as explicit config although they are the defaults. */
const LEGACY_DEFAULTS: Partial<Record<keyof DesignConfig, unknown>> = {
  theme: "minimal",
  spacingPreset: "normal",
};

/**
 * Reconciles a stored document: a design block in the source wins; otherwise design
 * overrides kept only in the legacy stored config are written into the source once.
 */
export function syncDocumentDesign(
  source: string,
  config: ResumeConfig,
): { source: string; config: ResumeConfig } {
  const fromSource = readDesignBlock(source);
  if (fromSource === null) return { source, config };
  if (Object.keys(fromSource).length > 0) {
    return { source, config: withLocale(fromSource, config.locale) };
  }

  const legacy = designOf(config) as Record<string, unknown>;
  for (const [key, value] of Object.entries(LEGACY_DEFAULTS)) {
    if (legacy[key] === value) delete legacy[key];
  }
  const nextConfig = withLocale(legacy as DesignConfig, config.locale);
  if (Object.keys(legacy).length === 0) return { source, config: nextConfig };
  return { source: writeDesign(source, nextConfig), config: nextConfig };
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
