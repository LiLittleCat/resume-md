"use client";

import { create } from "zustand";
import type { ResumeConfig, SectionId } from "@/core/schema";
import { PREVIEW_SCALE, clampPreviewScale } from "@/lib/preview-scale";
import { deepMerge, deletePath, resetDocumentDesign as clearDocumentDesign } from "@/core/style";
import type { ColorSchemePreference } from "@/lib/color-scheme";
import {
  configFromSource,
  designOf,
  syncDocumentDesign,
  writeDesign,
} from "@/lib/document-design";

export interface EditorState {
  source: string;
  config: ResumeConfig;
  selectedSectionId: SectionId | null;
  selectedSectionTitle: string | null;
  previewScale: number;
  leftPanelRatio: number;
  rightPanelWidth: number;
  designPanelCollapsed: boolean;
  colorScheme: ColorSchemePreference;
  setSource: (source: string) => void;
  /** Replaces the config and mirrors its design part into the trailing design block. */
  setConfig: (config: ResumeConfig) => void;
  patchConfig: (patch: ResumeConfig) => void;
  resetConfigPath: (path: string[]) => void;
  resetDocumentDesign: () => void;
  selectSection: (id: SectionId | null, title?: string | null) => void;
  setPreviewScale: (scale: number) => void;
  setLeftPanelRatio: (ratio: number) => void;
  setRightPanelWidth: (width: number) => void;
  setDesignPanelCollapsed: (collapsed: boolean) => void;
  setColorScheme: (colorScheme: ColorSchemePreference) => void;
  headingFocus:
    | { kind: "header"; nonce: number }
    | { kind: "heading"; title: string; depth: 1 | 2; sectionTitle: string; nonce: number }
    | null;
  focusPreviewAnchor: (
    anchor:
      | { kind: "header" }
      | { kind: "heading"; title: string; depth: 1 | 2; sectionTitle: string },
  ) => void;
  loadDocument: (source: string, config?: ResumeConfig) => void;
}

function withConfig(state: Pick<EditorState, "source" | "config">, config: ResumeConfig) {
  const unchanged =
    JSON.stringify(designOf(config)) === JSON.stringify(designOf(state.config));
  return { config, source: unchanged ? state.source : writeDesign(state.source, config) };
}

export const useEditorStore = create<EditorState>((set, get) => ({
  source: "",
  config: {},
  selectedSectionId: null,
  selectedSectionTitle: null,
  previewScale: PREVIEW_SCALE.default,
  leftPanelRatio: 0.5,
  rightPanelWidth: 260,
  designPanelCollapsed: false,
  colorScheme: "system",
  setSource: (source) => set({ source, config: configFromSource(source, get().config) }),
  setConfig: (config) => set(withConfig(get(), config)),
  patchConfig: (patch) => set(withConfig(get(), deepMerge(get().config, patch))),
  resetConfigPath: (path) =>
    set(
      withConfig(
        get(),
        deletePath(get().config as Record<string, unknown>, path) as ResumeConfig,
      ),
    ),
  resetDocumentDesign: () => set(withConfig(get(), clearDocumentDesign(get().config))),
  selectSection: (selectedSectionId, selectedSectionTitle = null) =>
    set({ selectedSectionId, selectedSectionTitle, headingFocus: null }),
  setPreviewScale: (previewScale) => set({ previewScale: clampPreviewScale(previewScale) }),
  setLeftPanelRatio: (leftPanelRatio) => set({ leftPanelRatio }),
  setRightPanelWidth: (rightPanelWidth) => set({ rightPanelWidth }),
  setDesignPanelCollapsed: (designPanelCollapsed) => set({ designPanelCollapsed }),
  setColorScheme: (colorScheme) => set({ colorScheme }),
  headingFocus: null,
  focusPreviewAnchor: (anchor) =>
    set({ headingFocus: { ...anchor, nonce: Date.now() } }),
  loadDocument: (source, config) =>
    set({
      ...syncDocumentDesign(source, config ?? {}),
      selectedSectionId: null,
      selectedSectionTitle: null,
      headingFocus: null,
    }),
}));
