import { locales } from "@/locales";
import { LocaleIdSchema, type LocaleDefinition, type LocaleId } from "../schema";

export function resolveLocale(id: string | undefined | null): LocaleDefinition {
  const parsed = LocaleIdSchema.safeParse(id);
  const localeId: LocaleId = parsed.success ? parsed.data : "zh-CN";
  return locales[localeId];
}

export function isLocaleId(value: string): value is LocaleId {
  return LocaleIdSchema.safeParse(value).success;
}
