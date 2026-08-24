import { z } from "zod";
import {
  EducationLayoutSchema,
  ExperienceLayoutSchema,
  LocaleIdSchema,
  PageSizeIdSchema,
  ProjectLayoutSchema,
  SkillsLayoutSchema,
  ThemeIdSchema,
} from "./ids";
import { CompleteIconConfigSchema } from "./icons";
import {
  CompleteSpacingSchema,
  CompleteTypographySchema,
  FlexibleSpacingSchema,
  FontStackSchema,
  PageMarginSchema,
  ThemeColorsSchema,
  TypographyConfigSchema,
} from "./style";

export const LayoutDefaultsSchema = z.object({
  experience: ExperienceLayoutSchema,
  projects: ProjectLayoutSchema,
  skills: SkillsLayoutSchema,
  education: EducationLayoutSchema,
});

export type LayoutDefaults = z.infer<typeof LayoutDefaultsSchema>;

export const PageConfigSchema = z.object({
  size: PageSizeIdSchema,
  margin: PageMarginSchema,
});

export type PageConfig = z.infer<typeof PageConfigSchema>;

export const PaginationRulesSchema = z.object({
  keepSectionTitleWithBody: z.boolean(),
  keepItemHeaderWithBody: z.boolean(),
  avoidBulletSplit: z.boolean(),
});

export type PaginationRules = z.infer<typeof PaginationRulesSchema>;

export const HeaderStyleSchema = z.object({
  alignment: z.enum(["left", "center"]),
  rule: z.boolean(),
  contactSeparator: z.string().min(1),
});

export type HeaderStyle = z.infer<typeof HeaderStyleSchema>;

export const SectionTitleStyleSchema = z.object({
  transform: z.enum(["none", "uppercase"]),
  rule: z.boolean(),
});

export type SectionTitleStyle = z.infer<typeof SectionTitleStyleSchema>;

export const ComponentStylesSchema = z.object({
  header: HeaderStyleSchema,
  sectionTitle: SectionTitleStyleSchema,
});

export type ComponentStyles = z.infer<typeof ComponentStylesSchema>;

export const LocaleThemePresetSchema = z.object({
  typography: TypographyConfigSchema.optional(),
  spacing: CompleteSpacingSchema.partial().optional(),
  fonts: FontStackSchema.partial().optional(),
});

export type LocaleThemePreset = z.infer<typeof LocaleThemePresetSchema>;

export const ThemeDefinitionSchema = z.object({
  id: ThemeIdSchema,
  name: z.string().min(1),
  fonts: FontStackSchema,
  colors: ThemeColorsSchema,
  typography: CompleteTypographySchema,
  spacing: CompleteSpacingSchema,
  spacingPresets: z.object({
    compact: CompleteSpacingSchema,
    normal: CompleteSpacingSchema,
    relaxed: CompleteSpacingSchema,
  }),
  layout: LayoutDefaultsSchema,
  icons: CompleteIconConfigSchema,
  page: PageConfigSchema,
  pagination: PaginationRulesSchema,
  components: ComponentStylesSchema,
  flexibleSpacing: z.object({
    sectionGap: FlexibleSpacingSchema,
    itemGap: FlexibleSpacingSchema,
  }),
  localePresets: z.partialRecord(LocaleIdSchema, LocaleThemePresetSchema),
});

export type ThemeDefinition = z.infer<typeof ThemeDefinitionSchema>;
