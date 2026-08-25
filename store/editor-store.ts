"use client";

import { create } from "zustand";
import type { ResumeConfig, SectionId } from "@/core/schema";
import { PREVIEW_SCALE, clampPreviewScale } from "@/lib/preview-scale";
import { deepMerge, deletePath, resetDocumentDesign as clearDocumentDesign } from "@/core/style";
import type { ColorSchemePreference } from "@/lib/color-scheme";

export interface EditorState {
  source: string;
  config: ResumeConfig;
  selectedSectionId: SectionId | null;
  selectedSectionTitle: string | null;
  previewScale: number;
  leftPanelWidth: number;
  rightPanelWidth: number;
  colorScheme: ColorSchemePreference;
  setSource: (source: string) => void;
  patchConfig: (patch: ResumeConfig) => void;
  resetConfigPath: (path: string[]) => void;
  resetDocumentDesign: () => void;
  selectSection: (id: SectionId | null, title?: string | null) => void;
  setPreviewScale: (scale: number) => void;
  setLeftPanelWidth: (width: number) => void;
  setRightPanelWidth: (width: number) => void;
  setColorScheme: (colorScheme: ColorSchemePreference) => void;
  headingFocus: { title: string; depth: 1 | 2; nonce: number } | null;
  focusHeading: (title: string, depth: 1 | 2) => void;
  loadDocument: (source: string, config?: ResumeConfig) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  source: "",
  config: {},
  selectedSectionId: null,
  selectedSectionTitle: null,
  previewScale: PREVIEW_SCALE.default,
  leftPanelWidth: 380,
  rightPanelWidth: 220,
  colorScheme: "system",
  setSource: (source) => set({ source }),
  patchConfig: (patch) => set({ config: deepMerge(get().config, patch) }),
  resetConfigPath: (path) =>
    set({
      config: deletePath(get().config as Record<string, unknown>, path) as ResumeConfig,
    }),
  resetDocumentDesign: () => set({ config: clearDocumentDesign(get().config) }),
  selectSection: (selectedSectionId, selectedSectionTitle = null) =>
    set({ selectedSectionId, selectedSectionTitle }),
  setPreviewScale: (previewScale) => set({ previewScale: clampPreviewScale(previewScale) }),
  setLeftPanelWidth: (leftPanelWidth) => set({ leftPanelWidth }),
  setRightPanelWidth: (rightPanelWidth) => set({ rightPanelWidth }),
  setColorScheme: (colorScheme) => set({ colorScheme }),
  headingFocus: null,
  focusHeading: (title, depth) =>
    set({ headingFocus: { title, depth, nonce: Date.now() } }),
  loadDocument: (source, config) =>
    set({
      source,
      config: config ?? {},
      selectedSectionId: null,
      selectedSectionTitle: null,
    }),
}));

