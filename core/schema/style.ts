import { z } from "zod";

export const TextStyleSchema = z.object({
  fontSize: z.number().positive().optional(),
  lineHeight: z.number().positive().optional(),
  fontWeight: z.number().min(100).max(900).optional(),
  letterSpacing: z.number().optional(),
  fontFamily: z.string().min(1).optional(),
});

export type TextStyle = z.infer<typeof TextStyleSchema>;

export const CompleteTextStyleSchema = z.object({
  fontSize: z.number().positive(),
  lineHeight: z.number().positive(),
  fontWeight: z.number().min(100).max(900),
  letterSpacing: z.number(),
  fontFamily: z.string().min(1).optional(),
});

export type CompleteTextStyle = z.infer<typeof CompleteTextStyleSchema>;

export const TypographyConfigSchema = z.object({
  base: TextStyleSchema.optional(),
  name: TextStyleSchema.optional(),
  headline: TextStyleSchema.optional(),
  sectionTitle: TextStyleSchema.optional(),
  itemTitle: TextStyleSchema.optional(),
  itemSubtitle: TextStyleSchema.optional(),
  body: TextStyleSchema.optional(),
  meta: TextStyleSchema.optional(),
  bullet: TextStyleSchema.optional(),
});

export type TypographyConfig = z.infer<typeof TypographyConfigSchema>;

export const CompleteTypographySchema = z.object({
  base: CompleteTextStyleSchema,
  name: CompleteTextStyleSchema,
  headline: CompleteTextStyleSchema,
  sectionTitle: CompleteTextStyleSchema,
  itemTitle: CompleteTextStyleSchema,
  itemSubtitle: CompleteTextStyleSchema,
  body: CompleteTextStyleSchema,
  meta: CompleteTextStyleSchema,
  bullet: CompleteTextStyleSchema,
});

export type CompleteTypography = z.infer<typeof CompleteTypographySchema>;

export const SpacingConfigSchema = z.object({
  sectionGap: z.number().nonnegative().optional(),
  itemGap: z.number().nonnegative().optional(),
  contentGap: z.number().nonnegative().optional(),
  bulletGap: z.number().nonnegative().optional(),
  paragraphGap: z.number().nonnegative().optional(),
  headerGap: z.number().nonnegative().optional(),
});

export type SpacingConfig = z.infer<typeof SpacingConfigSchema>;

export const CompleteSpacingSchema = z.object({
  sectionGap: z.number().nonnegative(),
  itemGap: z.number().nonnegative(),
  contentGap: z.number().nonnegative(),
  bulletGap: z.number().nonnegative(),
  paragraphGap: z.number().nonnegative(),
  headerGap: z.number().nonnegative(),
});

export type CompleteSpacing = z.infer<typeof CompleteSpacingSchema>;

export const FlexibleSpacingSchema = z.object({
  min: z.number(),
  ideal: z.number(),
  max: z.number(),
});

export type FlexibleSpacing = z.infer<typeof FlexibleSpacingSchema>;

export const FontStackSchema = z.object({
  latin: z.string().min(1),
  cjk: z.string().min(1),
  monospace: z.string().min(1),
});

export type FontStack = z.infer<typeof FontStackSchema>;

export const ThemeColorsSchema = z.object({
  text: z.string().min(1),
  muted: z.string().min(1),
  rule: z.string().min(1),
  accent: z.string().min(1),
  background: z.string().min(1),
});

export type ThemeColors = z.infer<typeof ThemeColorsSchema>;

export const PageMarginSchema = z.object({
  top: z.number().nonnegative(),
  right: z.number().nonnegative(),
  bottom: z.number().nonnegative(),
  left: z.number().nonnegative(),
});

export type PageMargin = z.infer<typeof PageMarginSchema>;
