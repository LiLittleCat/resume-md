import type { ResumeConfig } from "../schema";

const PRESERVED_DOCUMENT_KEYS = new Set(["theme", "locale", "sections"]);

export function hasDocumentDesignOverrides(config: ResumeConfig): boolean {
  return Object.keys(config).some((key) => !PRESERVED_DOCUMENT_KEYS.has(key));
}

export function resetDocumentDesign(config: ResumeConfig): ResumeConfig {
  const next: ResumeConfig = {};
  if (config.theme) next.theme = config.theme;
  if (config.locale) next.locale = config.locale;
  if (config.sections) next.sections = config.sections;
  return next;
}
