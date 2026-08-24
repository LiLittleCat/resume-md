import { themes } from "@/themes";
import { ThemeDefinitionSchema, type ThemeDefinition, type ThemeId } from "../schema";
import { resolveThemeId } from "../style/resolver";

export function listThemes(): ThemeDefinition[] {
  return Object.values(themes).map((theme) => ThemeDefinitionSchema.parse(theme));
}

export function getThemeDefinition(id: string | undefined | null): ThemeDefinition {
  const themeId: ThemeId = resolveThemeId(id);
  return ThemeDefinitionSchema.parse(themes[themeId]);
}
