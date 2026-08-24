import { z } from "zod";
import {
  AvatarPositionSchema,
  AvatarShapeSchema,
  EducationLayoutSchema,
  ExperienceLayoutSchema,
  LocaleIdSchema,
  PageSizeIdSchema,
  ProjectLayoutSchema,
  ResumeIconSchema,
  SectionIdSchema,
  SkillsLayoutSchema,
  SpacingPresetSchema,
  ThemeIdSchema,
} from "./ids";
import { IconConfigSchema } from "./icons";
import { FontStackSchema, PageMarginSchema, SpacingConfigSchema, TypographyConfigSchema } from "./style";

export const LayoutConfigSchema = z.object({
  experience: ExperienceLayoutSchema.optional(),
  projects: ProjectLayoutSchema.optional(),
  skills: SkillsLayoutSchema.optional(),
  education: EducationLayoutSchema.optional(),
});

export type LayoutConfig = z.infer<typeof LayoutConfigSchema>;

export const PageOverrideSchema = z.object({
  size: PageSizeIdSchema.optional(),
  margin: PageMarginSchema.partial().optional(),
});

export const SectionOverrideSchema = z.object({
  typography: TypographyConfigSchema.optional(),
  spacing: SpacingConfigSchema.optional(),
  layout: z
    .union([
      ExperienceLayoutSchema,
      ProjectLayoutSchema,
      SkillsLayoutSchema,
      EducationLayoutSchema,
    ])
    .optional(),
  icon: ResumeIconSchema.optional(),
});

export type SectionOverride = z.infer<typeof SectionOverrideSchema>;

export const ResumeConfigSchema = z.object({
  theme: ThemeIdSchema.optional(),
  locale: LocaleIdSchema.optional(),
  spacingPreset: SpacingPresetSchema.optional(),
  fonts: FontStackSchema.partial().optional(),
  typography: TypographyConfigSchema.optional(),
  spacing: SpacingConfigSchema.optional(),
  page: PageOverrideSchema.optional(),
  icons: IconConfigSchema.optional(),
  layout: LayoutConfigSchema.optional(),
  avatar: z
    .object({
      position: AvatarPositionSchema.optional(),
      shape: AvatarShapeSchema.optional(),
      sizeMm: z.number().positive().optional(),
    })
    .optional(),
  sections: z.partialRecord(SectionIdSchema, SectionOverrideSchema).optional(),
});

export type ResumeConfig = z.infer<typeof ResumeConfigSchema>;

export const emptyResumeConfig = (): ResumeConfig => ({});
