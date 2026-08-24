import { z } from "zod";
import {
  IconModeSchema,
  IconProviderSchema,
  ResumeIconSchema,
  SectionIdSchema,
} from "./ids";

export const IconConfigSchema = z.object({
  mode: IconModeSchema.optional(),
  provider: IconProviderSchema.optional(),
  size: z.number().positive().optional(),
  strokeWidth: z.number().positive().optional(),
  gap: z.number().nonnegative().optional(),
  sections: z.partialRecord(SectionIdSchema, ResumeIconSchema).optional(),
});

export type IconConfig = z.infer<typeof IconConfigSchema>;

export const CompleteIconConfigSchema = z.object({
  mode: IconModeSchema,
  provider: IconProviderSchema,
  size: z.number().positive(),
  strokeWidth: z.number().positive(),
  gap: z.number().nonnegative(),
  sections: z.partialRecord(SectionIdSchema, ResumeIconSchema),
});

export type CompleteIconConfig = z.infer<typeof CompleteIconConfigSchema>;
