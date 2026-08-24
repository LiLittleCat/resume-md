import { resolveLocale } from "./locale";
import { parseResumeMarkdown, type ParseResumeResult } from "./parser";
import { ResumeConfigSchema, type LocaleDefinition, type ResumeConfig, type ThemeDefinition } from "./schema";
import { getTheme, resolveStyle } from "./style";
import type { ResolvedDocumentStyle } from "./style";

export interface CompileResumeInput {
  source: string;
  config?: ResumeConfig;
  runtime?: ResumeConfig;
}

export interface CompiledResume {
  resume: ParseResumeResult["resume"];
  warnings: ParseResumeResult["warnings"];
  frontMatter: ParseResumeResult["frontMatter"];
  config: ResumeConfig;
  style: ResolvedDocumentStyle;
  locale: LocaleDefinition;
  theme: ThemeDefinition;
}

export function compileResume(input: CompileResumeInput): CompiledResume {
  const parsed = parseResumeMarkdown(input.source);
  const config = ResumeConfigSchema.parse(input.config ?? {});
  const runtime = ResumeConfigSchema.parse(input.runtime ?? {});
  const localeId = runtime.locale ?? config.locale ?? parsed.resume.locale;
  const themeId = runtime.theme ?? config.theme ?? parsed.frontMatter.theme;
  const locale = resolveLocale(localeId);
  const theme = getTheme(themeId);
  const style = resolveStyle({
    themeId: theme.id,
    localeId: locale.id,
    config,
    runtime,
  });

  return {
    resume: {
      ...parsed.resume,
      locale: locale.id,
    },
    warnings: parsed.warnings,
    frontMatter: parsed.frontMatter,
    config,
    style,
    locale,
    theme,
  };
}
