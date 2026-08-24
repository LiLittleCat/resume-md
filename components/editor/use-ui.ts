"use client";

import { resolveUiLocale, getUiCopy } from "@/locales/ui";
import { useEditorStore } from "@/store/editor-store";

export function useUiLocale() {
  return resolveUiLocale(useEditorStore((state) => state.config.locale));
}

export function useUi() {
  return getUiCopy(useUiLocale());
}
