import type { ThemeDefinition, ThemeId } from "@/core/schema";
import { classicTheme } from "./classic";
import { kamiTheme } from "./kami";
import { minimalTheme } from "./minimal";
import { modernTheme } from "./modern";

export const themes: Record<ThemeId, ThemeDefinition> = {
  minimal: minimalTheme,
  modern: modernTheme,
  classic: classicTheme,
  kami: kamiTheme,
};

export { minimalTheme, modernTheme, classicTheme, kamiTheme };
