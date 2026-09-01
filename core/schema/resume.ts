import { z } from "zod";
import { ContactFieldSchema, LocaleIdSchema, SectionIdSchema } from "./ids";

export const ResumeDateSchema = z.object({
  raw: z.string(),
  year: z.number().int().optional(),
  month: z.number().int().min(1).max(12).optional(),
  day: z.number().int().min(1).max(31).optional(),
  present: z.boolean().optional(),
});

export type ResumeDate = z.infer<typeof ResumeDateSchema>;

export const ContactSchema = z.partialRecord(ContactFieldSchema, z.string().min(1));

export type Contact = z.infer<typeof ContactSchema>;

export const ProfileSchema = z.object({
  name: z.string(),
  title: z.string().optional(),
  avatar: z.string().min(1).optional(),
  contact: ContactSchema,
});

export type Profile = z.infer<typeof ProfileSchema>;

export const SkillGroupSchema = z.object({
  name: z.string(),
  items: z.array(z.string().min(1)),
  listType: z.enum(["ordered", "unordered"]).optional(),
  listStart: z.number().int().optional(),
});

export type SkillGroup = z.infer<typeof SkillGroupSchema>;

export const ExperienceItemSchema = z.object({
  company: z.string().min(1),
  position: z.string().optional(),
  startDate: ResumeDateSchema.optional(),
  endDate: ResumeDateSchema.optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  responsibilities: z.array(z.string().min(1)).optional(),
  achievements: z.array(z.string().min(1)).optional(),
});

export type ExperienceItem = z.infer<typeof ExperienceItemSchema>;

export const ProjectBlockSchema = z.object({
  heading: z.string().min(1).optional(),
  type: z.enum(["paragraph", "tags", "unordered-list", "ordered-list"]),
  items: z.array(z.string().min(1)),
  start: z.number().int().optional(),
});

export type ProjectBlock = z.infer<typeof ProjectBlockSchema>;

export const ProjectItemSchema = z.object({
  name: z.string().min(1),
  role: z.string().optional(),
  startDate: ResumeDateSchema.optional(),
  endDate: ResumeDateSchema.optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  techStack: z.array(z.string().min(1)).optional(),
  responsibilities: z.array(z.string().min(1)).optional(),
  achievements: z.array(z.string().min(1)).optional(),
  blocks: z.array(ProjectBlockSchema).optional(),
});

export type ProjectItem = z.infer<typeof ProjectItemSchema>;

export const EducationItemSchema = z.object({
  school: z.string().min(1),
  degree: z.string().optional(),
  major: z.string().optional(),
  startDate: ResumeDateSchema.optional(),
  endDate: ResumeDateSchema.optional(),
  location: z.string().optional(),
  details: z.array(z.string().min(1)).optional(),
});

export type EducationItem = z.infer<typeof EducationItemSchema>;

export const GenericItemSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  startDate: ResumeDateSchema.optional(),
  endDate: ResumeDateSchema.optional(),
  description: z.string().optional(),
  highlights: z.array(z.string().min(1)).optional(),
});

export type GenericItem = z.infer<typeof GenericItemSchema>;

export const SummarySectionSchema = z.object({
  id: z.literal("summary"),
  title: z.string().min(1),
  content: z.array(z.string().min(1)),
});

export type SummarySection = z.infer<typeof SummarySectionSchema>;

export const SkillsSectionSchema = z.object({
  id: z.literal("skills"),
  title: z.string().min(1),
  groups: z.array(SkillGroupSchema),
});

export type SkillsSection = z.infer<typeof SkillsSectionSchema>;

export const ExperienceSectionSchema = z.object({
  id: z.literal("experience"),
  title: z.string().min(1),
  items: z.array(ExperienceItemSchema),
});

export type ExperienceSection = z.infer<typeof ExperienceSectionSchema>;

export const ProjectsSectionSchema = z.object({
  id: z.literal("projects"),
  title: z.string().min(1),
  items: z.array(ProjectItemSchema),
});

export type ProjectsSection = z.infer<typeof ProjectsSectionSchema>;

export const EducationSectionSchema = z.object({
  id: z.literal("education"),
  title: z.string().min(1),
  items: z.array(EducationItemSchema),
});

export type EducationSection = z.infer<typeof EducationSectionSchema>;

export const CustomSectionSchema = z.object({
  id: z.literal("custom"),
  title: z.string().min(1),
  items: z.array(GenericItemSchema),
  blocks: z.array(z.string()).optional(),
});

export type CustomSection = z.infer<typeof CustomSectionSchema>;

export const GenericSectionSchema = z.object({
  id: SectionIdSchema.exclude([
    "summary",
    "skills",
    "experience",
    "projects",
    "education",
    "custom",
  ]),
  title: z.string().min(1),
  items: z.array(GenericItemSchema),
  blocks: z.array(z.string()).optional(),
});

export type GenericSection = z.infer<typeof GenericSectionSchema>;

export const ResumeSectionSchema = z.discriminatedUnion("id", [
  SummarySectionSchema,
  SkillsSectionSchema,
  ExperienceSectionSchema,
  ProjectsSectionSchema,
  EducationSectionSchema,
  CustomSectionSchema,
  GenericSectionSchema,
]);

export type ResumeSection = z.infer<typeof ResumeSectionSchema>;

export const ResumeSchema = z.object({
  locale: LocaleIdSchema,
  profile: ProfileSchema,
  sections: z.array(ResumeSectionSchema),
});

export type Resume = z.infer<typeof ResumeSchema>;

export const FrontMatterSchema = z.object({
  name: z.string().optional(),
  title: z.string().optional(),
  avatar: z.string().min(1).optional(),
  contact: ContactSchema.optional(),
  locale: LocaleIdSchema.optional(),
  theme: z.string().optional(),
});

export type FrontMatter = z.infer<typeof FrontMatterSchema>;

export const ParseWarningSchema = z.object({
  code: z.string(),
  message: z.string(),
});

export type ParseWarning = z.infer<typeof ParseWarningSchema>;
