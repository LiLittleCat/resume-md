import { z } from "zod";
import { LocaleIdSchema, SECTION_IDS } from "./ids";
import { TypographyConfigSchema } from "./style";

const sectionLabelFields = Object.fromEntries(
  SECTION_IDS.map((id) => [id, z.string().min(1)]),
) as Record<(typeof SECTION_IDS)[number], z.ZodString>;

export const LocaleLabelsSchema = z.object({
  ...sectionLabelFields,
  present: z.string().min(1),
  responsibilities: z.string().min(1),
  achievements: z.string().min(1),
  techStack: z.string().min(1),
  description: z.string().min(1),
});

export type LocaleLabels = z.infer<typeof LocaleLabelsSchema>;

export const LocaleDefinitionSchema = z.object({
  id: LocaleIdSchema,
  name: z.string().min(1),
  labels: LocaleLabelsSchema,
  date: z.object({
    format: z.enum(["zh-dot", "en-short"]),
  }),
  typographyPreset: TypographyConfigSchema.optional(),
});

export type LocaleDefinition = z.infer<typeof LocaleDefinitionSchema>;
