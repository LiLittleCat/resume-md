import type { ThemeDefinition, ThemeId } from "@/core/schema";
import { classicTheme } from "./classic";
import { minimalTheme } from "./minimal";
import { modernTheme } from "./modern";

export const themes: Record<ThemeId, ThemeDefinition> = {
  minimal: minimalTheme,
  modern: modernTheme,
  classic: classicTheme,
};

export { minimalTheme, modernTheme, classicTheme };
