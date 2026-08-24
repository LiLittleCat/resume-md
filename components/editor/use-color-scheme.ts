"use client";

import { useEffect, useState } from "react";
import {
  resolveColorScheme,
  type ColorSchemePreference,
  type ResolvedColorScheme,
} from "@/lib/color-scheme";
import { useEditorStore } from "@/store/editor-store";

export function useColorScheme() {
  const preference = useEditorStore((state) => state.colorScheme);
  const setColorScheme = useEditorStore((state) => state.setColorScheme);
  const [systemDark, setSystemDark] = useState<boolean | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => setSystemDark(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const resolved: ResolvedColorScheme = resolveColorScheme(
    preference,
    systemDark ?? false,
  );

  useEffect(() => {
    if (preference === "system" && systemDark === null) return;
    document.documentElement.classList.toggle("dark", resolved === "dark");
    document.documentElement.style.colorScheme = resolved;
  }, [preference, resolved, systemDark]);

  return { preference, resolved, setColorScheme };
}

export type { ColorSchemePreference, ResolvedColorScheme };
