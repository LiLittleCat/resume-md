import type { CompleteTextStyle, CompleteTypography, TypographyRole } from "../schema";
import { TYPOGRAPHY_ROLES } from "../schema/ids";
import type { ResolvedDocumentStyle, ResolvedSectionStyle } from "../style";

export type CssVarMap = Record<string, string>;

export function toDocumentCssVars(style: ResolvedDocumentStyle): CssVarMap {
  return {
    "--resume-page-width": `${style.page.widthMm}mm`,
    "--resume-page-height": `${style.page.heightMm}mm`,
    "--resume-margin-top": `${style.page.margin.top}mm`,
    "--resume-margin-right": `${style.page.margin.right}mm`,
    "--resume-margin-bottom": `${style.page.margin.bottom}mm`,
    "--resume-margin-left": `${style.page.margin.left}mm`,
    "--resume-font-latin": quoteFont(style.fonts.latin),
    "--resume-font-cjk": quoteFont(style.fonts.cjk),
    "--resume-font-mono": quoteFont(style.fonts.monospace),
    "--resume-font-stack":
      style.localeId === "zh-CN"
        ? `${quoteFont(style.fonts.cjk)}, ${quoteFont(style.fonts.latin)}, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif`
        : `${quoteFont(style.fonts.latin)}, ${quoteFont(style.fonts.cjk)}, "PingFang SC", "Hiragino Sans GB", sans-serif`,
    "--resume-color-text": style.colors.text,
    "--resume-color-muted": style.colors.muted,
    "--resume-color-rule": style.colors.rule,
    "--resume-color-accent": style.colors.accent,
    "--resume-color-background": style.colors.background,
    "--resume-icon-size": `${style.icons.size}pt`,
    "--resume-icon-stroke": String(style.icons.strokeWidth),
    "--resume-icon-gap": `${style.icons.gap}mm`,
    "--resume-avatar-size": `${style.components.avatar.sizeMm}mm`,
    ...typographyVars(style.typography),
    ...spacingVars(style.spacing),
  };
}

export function toSectionCssVars(section: ResolvedSectionStyle): CssVarMap {
  return {
    ...typographyVars(section.typography),
    ...spacingVars(section.spacing),
  };
}

export function quoteFont(name: string): string {
  return name.includes(" ") ? `"${name}"` : name;
}

function typographyVars(typography: CompleteTypography): CssVarMap {
  const vars: CssVarMap = {};
  for (const role of TYPOGRAPHY_ROLES) {
    Object.assign(vars, textStyleVars(role, typography[role]));
  }
  return vars;
}

function textStyleVars(role: TypographyRole, style: CompleteTextStyle): CssVarMap {
  const prefix = `--resume-${kebab(role)}`;
  const vars: CssVarMap = {
    [`${prefix}-size`]: `${style.fontSize}pt`,
    [`${prefix}-leading`]: String(style.lineHeight),
    [`${prefix}-weight`]: String(style.fontWeight),
    [`${prefix}-tracking`]: `${style.letterSpacing}em`,
  };
  if (style.fontFamily) {
    vars[`${prefix}-font`] = quoteFont(style.fontFamily);
  }
  return vars;
}

function spacingVars(spacing: ResolvedSectionStyle["spacing"]): CssVarMap {
  return {
    "--resume-section-gap": `${spacing.sectionGap}mm`,
    "--resume-item-gap": `${spacing.itemGap}mm`,
    "--resume-content-gap": `${spacing.contentGap}mm`,
    "--resume-bullet-gap": `${spacing.bulletGap}mm`,
    "--resume-paragraph-gap": `${spacing.paragraphGap}mm`,
    "--resume-header-gap": `${spacing.headerGap}mm`,
  };
}

function kebab(value: string): string {
  return value.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}
