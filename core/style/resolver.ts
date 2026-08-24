import { themes } from "@/themes";
import { resolveLocale } from "../locale";
import {
  DEFAULT_CONTACT_ICONS,
  DEFAULT_SECTION_ICONS,
} from "../icons/registry";
import {
  PAGE_DIMENSIONS,
  SECTION_IDS,
  ThemeIdSchema,
  type CompleteSpacing,
  type CompleteTypography,
  type ResumeConfig,
  type SectionId,
  type ThemeDefinition,
  type ThemeId,
  type TypographyRole,
} from "../schema";
import { TYPOGRAPHY_ROLES } from "../schema/ids";
import { deepMerge } from "./merge";
import type { ResolvedDocumentStyle, ResolvedSectionStyle } from "./resolved";

export interface ResolveStyleInput {
  themeId?: string | null;
  localeId?: string | null;
  config?: ResumeConfig;
  runtime?: ResumeConfig;
}

export function resolveThemeId(id: string | undefined | null): ThemeId {
  const parsed = ThemeIdSchema.safeParse(id);
  return parsed.success ? parsed.data : "minimal";
}

export function getTheme(id: string | undefined | null): ThemeDefinition {
  return themes[resolveThemeId(id)];
}

export function configWithTheme(config: ResumeConfig, theme: ThemeId): ResumeConfig {
  return deepMerge(config, { theme, icons: { mode: getTheme(theme).icons.mode } });
}

export function resolveStyle(input: ResolveStyleInput): ResolvedDocumentStyle {
  const config = input.config ?? {};
  const runtime = input.runtime ?? {};
  const locale = resolveLocale(runtime.locale ?? config.locale ?? input.localeId);
  const theme = getTheme(runtime.theme ?? config.theme ?? input.themeId);

  const documentLayer = mergeDocumentLayers(theme, locale.id, config, runtime);
  const pageSize = documentLayer.page.size;
  const dimensions = PAGE_DIMENSIONS[pageSize];
  const iconMode = documentLayer.icons.mode;

  const sections = Object.fromEntries(
    SECTION_IDS.map((sectionId) => [
      sectionId,
      resolveSectionStyle(sectionId, theme, documentLayer, config, runtime, iconMode !== "none"),
    ]),
  ) as Record<SectionId, ResolvedSectionStyle>;

  return {
    themeId: theme.id,
    localeId: locale.id,
    fonts: documentLayer.fonts,
    colors: theme.colors,
    typography: documentLayer.typography,
    spacing: documentLayer.spacing,
    page: {
      ...documentLayer.page,
      widthMm: dimensions.widthMm,
      heightMm: dimensions.heightMm,
    },
    icons: {
      ...documentLayer.icons,
      showContactIcons: iconMode === "full",
    },
    layout: documentLayer.layout,
    components: {
      ...theme.components,
      avatar: deepMerge(
        deepMerge(theme.components.avatar, config.avatar),
        runtime.avatar,
      ),
    },
    pagination: theme.pagination,
    contactIcons: DEFAULT_CONTACT_ICONS,
    sections,
  };
}

interface DocumentLayer {
  fonts: ThemeDefinition["fonts"];
  typography: CompleteTypography;
  spacing: CompleteSpacing;
  page: ThemeDefinition["page"];
  icons: ThemeDefinition["icons"];
  layout: ThemeDefinition["layout"];
}

function mergeDocumentLayers(
  theme: ThemeDefinition,
  localeId: import("../schema").LocaleId,
  config: ResumeConfig,
  runtime: ResumeConfig,
): DocumentLayer {
  const localePreset = theme.localePresets[localeId] ?? {};
  const localeDef = resolveLocale(localeId);

  let typography = theme.typography;
  typography = mergeTypography(typography, localeDef.typographyPreset);
  typography = mergeTypography(typography, localePreset.typography);
  typography = mergeTypography(typography, config.typography);
  typography = mergeTypography(typography, runtime.typography);

  const spacingPresetId = runtime.spacingPreset ?? config.spacingPreset ?? "normal";
  let spacing = theme.spacingPresets[spacingPresetId] ?? theme.spacing;
  spacing = deepMerge(spacing, localePreset.spacing);
  spacing = deepMerge(spacing, config.spacing);
  spacing = deepMerge(spacing, runtime.spacing);

  let fonts = theme.fonts;
  fonts = deepMerge(fonts, localePreset.fonts);
  fonts = deepMerge(fonts, config.fonts);
  fonts = deepMerge(fonts, runtime.fonts);

  let page = theme.page;
  page = deepMerge(page, config.page);
  page = deepMerge(page, runtime.page);

  let icons = theme.icons;
  icons = deepMerge(icons, config.icons);
  icons = deepMerge(icons, runtime.icons);

  let layout = theme.layout;
  layout = deepMerge(layout, config.layout);
  layout = deepMerge(layout, runtime.layout);

  return { fonts, typography, spacing, page, icons, layout };
}

function resolveSectionStyle(
  sectionId: SectionId,
  theme: ThemeDefinition,
  document: DocumentLayer,
  config: ResumeConfig,
  runtime: ResumeConfig,
  showSectionIcon: boolean,
): ResolvedSectionStyle {
  const sectionConfig = config.sections?.[sectionId];
  const sectionRuntime = runtime.sections?.[sectionId];

  const typography = mergeTypography(
    mergeTypography(document.typography, sectionConfig?.typography),
    sectionRuntime?.typography,
  );
  const spacing = deepMerge(
    deepMerge(document.spacing, sectionConfig?.spacing),
    sectionRuntime?.spacing,
  );

  const layout =
    sectionRuntime?.layout ??
    sectionConfig?.layout ??
    layoutForSection(sectionId, document.layout);

  const icon =
    sectionRuntime?.icon ??
    sectionConfig?.icon ??
    document.icons.sections[sectionId] ??
    DEFAULT_SECTION_ICONS[sectionId];

  return {
    typography,
    spacing,
    layout,
    icon,
    showSectionIcon,
  };
}

function layoutForSection(
  sectionId: SectionId,
  layout: ThemeDefinition["layout"],
): ResolvedSectionStyle["layout"] {
  switch (sectionId) {
    case "experience":
      return layout.experience;
    case "projects":
      return layout.projects;
    case "skills":
      return layout.skills;
    case "education":
      return layout.education;
    default:
      return undefined;
  }
}

function mergeTypography(
  base: CompleteTypography,
  override: import("../schema").TypographyConfig | undefined,
): CompleteTypography {
  if (!override) return base;
  const next = { ...base };
  for (const role of TYPOGRAPHY_ROLES) {
    const roleOverride = override[role as TypographyRole];
    if (!roleOverride) continue;
    next[role as TypographyRole] = deepMerge(base[role as TypographyRole], roleOverride);
  }
  if (override.base) {
    for (const role of ["body", "bullet"] as const) {
      if (override[role]) continue;
      next[role] = deepMerge(next[role], {
        fontSize: override.base.fontSize,
        lineHeight: override.base.lineHeight,
        fontFamily: override.base.fontFamily,
      });
    }
  }
  if (override.sectionTitle?.fontSize !== undefined && !override.itemTitle) {
    const sizeDelta = override.sectionTitle.fontSize - base.sectionTitle.fontSize;
    next.itemTitle = deepMerge(next.itemTitle, {
      fontSize: roundTypeSize(base.itemTitle.fontSize + sizeDelta),
    });
  }
  return next;
}

function roundTypeSize(size: number): number {
  return Math.max(8, Math.round(size * 2) / 2);
}
