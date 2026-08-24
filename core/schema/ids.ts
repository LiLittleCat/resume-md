import { z } from "zod";

export const SECTION_IDS = [
  "summary",
  "skills",
  "experience",
  "projects",
  "education",
  "openSource",
  "awards",
  "certifications",
  "publications",
  "languages",
  "interests",
  "custom",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export const MVP_SECTION_IDS = [
  "summary",
  "skills",
  "experience",
  "projects",
  "education",
] as const;

export type MvpSectionId = (typeof MVP_SECTION_IDS)[number];

export const SectionIdSchema = z.enum(SECTION_IDS);

export const THEME_IDS = ["minimal", "modern", "classic"] as const;
export type ThemeId = (typeof THEME_IDS)[number];
export const ThemeIdSchema = z.enum(THEME_IDS);

export const LOCALE_IDS = ["zh-CN", "en-US"] as const;
export type LocaleId = (typeof LOCALE_IDS)[number];
export const LocaleIdSchema = z.enum(LOCALE_IDS);

export const SPACING_PRESETS = ["compact", "normal", "relaxed"] as const;
export type SpacingPreset = (typeof SPACING_PRESETS)[number];
export const SpacingPresetSchema = z.enum(SPACING_PRESETS);

export const PAGE_SIZE_IDS = ["A4", "letter"] as const;
export type PageSizeId = (typeof PAGE_SIZE_IDS)[number];
export const PageSizeIdSchema = z.enum(PAGE_SIZE_IDS);

export const EXPERIENCE_LAYOUTS = ["default", "compact", "stacked"] as const;
export type ExperienceLayout = (typeof EXPERIENCE_LAYOUTS)[number];
export const ExperienceLayoutSchema = z.enum(EXPERIENCE_LAYOUTS);

export const PROJECT_LAYOUTS = ["default", "compact"] as const;
export type ProjectLayout = (typeof PROJECT_LAYOUTS)[number];
export const ProjectLayoutSchema = z.enum(PROJECT_LAYOUTS);

export const SKILLS_LAYOUTS = ["inline", "stacked", "columns"] as const;
export type SkillsLayout = (typeof SKILLS_LAYOUTS)[number];
export const SkillsLayoutSchema = z.enum(SKILLS_LAYOUTS);

export const EDUCATION_LAYOUTS = ["default", "compact"] as const;
export type EducationLayout = (typeof EDUCATION_LAYOUTS)[number];
export const EducationLayoutSchema = z.enum(EDUCATION_LAYOUTS);

export const ICON_MODES = ["none", "section", "full"] as const;
export type IconMode = (typeof ICON_MODES)[number];
export const IconModeSchema = z.enum(ICON_MODES);

export const ICON_PROVIDERS = ["lucide"] as const;
export type IconProvider = (typeof ICON_PROVIDERS)[number];
export const IconProviderSchema = z.enum(ICON_PROVIDERS);

export const RESUME_ICONS = [
  "profile",
  "summary",
  "skills",
  "code",
  "braces",
  "wrench",
  "briefcase",
  "company",
  "project",
  "rocket",
  "blocks",
  "education",
  "school",
  "award",
  "trophy",
  "medal",
  "certificate",
  "language",
  "location",
  "email",
  "phone",
  "website",
  "github",
  "linkedin",
] as const;

export type ResumeIcon = (typeof RESUME_ICONS)[number];
export const ResumeIconSchema = z.enum(RESUME_ICONS);

export const CONTACT_FIELDS = [
  "phone",
  "email",
  "location",
  "github",
  "linkedin",
  "website",
] as const;

export type ContactField = (typeof CONTACT_FIELDS)[number];
export const ContactFieldSchema = z.enum(CONTACT_FIELDS);

export const TYPOGRAPHY_ROLES = [
  "base",
  "name",
  "headline",
  "sectionTitle",
  "itemTitle",
  "itemSubtitle",
  "body",
  "meta",
  "bullet",
] as const;

export type TypographyRole = (typeof TYPOGRAPHY_ROLES)[number];
export const TypographyRoleSchema = z.enum(TYPOGRAPHY_ROLES);

export const PAGE_DIMENSIONS: Record<
  PageSizeId,
  { widthMm: number; heightMm: number }
> = {
  A4: { widthMm: 210, heightMm: 297 },
  letter: { widthMm: 215.9, heightMm: 279.4 },
};
