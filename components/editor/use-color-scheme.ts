"use client";

import { useAppliedColorScheme } from "@/components/chrome/use-applied-color-scheme";
import type { ColorSchemePreference, ResolvedColorScheme } from "@/lib/color-scheme";
import { useEditorStore } from "@/store/editor-store";

export function useColorScheme() {
  const preference = useEditorStore((state) => state.colorScheme);
  const setColorScheme = useEditorStore((state) => state.setColorScheme);
  const resolved = useAppliedColorScheme(preference);

  return { preference, resolved, setColorScheme };
}

export type { ColorSchemePreference, ResolvedColorScheme };
