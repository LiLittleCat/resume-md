"use client";

import { useEffect, useRef, useState } from "react";
import { parseResumeMarkdown } from "@/core/parser";
import type { LocaleId, ResumeConfig } from "@/core/schema";
import { A4Preview } from "@/components/preview/a4-preview";
import { DesignPanel } from "@/components/settings/design-panel";
import { EDITOR_STORAGE_KEY, useEditorStore } from "@/store/editor-store";
import { ContentPanel } from "./content-panel";
import { EditorToolbar } from "./editor-toolbar";
import { FloatingOutline } from "./floating-outline";
import { clampPanelWidth, PANEL_LAYOUT } from "./panel-layout";
import { ResizeHandle } from "./resize-handle";
import { useColorScheme } from "./use-color-scheme";
import { useUi, useUiLocale } from "./use-ui";

function readPanelWidth(side: "left" | "right", value: number | undefined): number {
  if (typeof value !== "number") return PANEL_LAYOUT[side].default;
  if (side === "left" && value === 320) return PANEL_LAYOUT.left.default;
  if (side === "right" && value === 300) return PANEL_LAYOUT.right.default;
  return value;
}

function withLocale(source: string, config: ResumeConfig): ResumeConfig {
  if (config.locale) return config;
  const parsed = parseResumeMarkdown(source);
  return { ...config, locale: parsed.frontMatter.locale ?? parsed.resume.locale };
}

function readStoredDocument(
  examples: Record<LocaleId, string>,
  defaultConfig: ResumeConfig,
): {
  source: string;
  config: ResumeConfig;
  leftPanelWidth: number;
  rightPanelWidth: number;
  colorScheme: "light" | "dark" | "system";
} {
  const fallback = {
    source: examples["zh-CN"],
    config: withLocale(examples["zh-CN"], defaultConfig),
    leftPanelWidth: PANEL_LAYOUT.left.default,
    rightPanelWidth: PANEL_LAYOUT.right.default,
    colorScheme: "system" as const,
  };
  const saved = window.localStorage.getItem(EDITOR_STORAGE_KEY);
  if (!saved) return fallback;
  try {
    const parsed = JSON.parse(saved) as {
      source?: string;
      config?: ResumeConfig;
      leftPanelWidth?: number;
      rightPanelWidth?: number;
      colorScheme?: "light" | "dark" | "system";
    };
    const source = parsed.source || examples["zh-CN"];
    return {
      source,
      config: withLocale(source, parsed.config ?? defaultConfig),
      leftPanelWidth: readPanelWidth("left", parsed.leftPanelWidth),
      rightPanelWidth: readPanelWidth("right", parsed.rightPanelWidth),
      colorScheme:
        parsed.colorScheme === "light" || parsed.colorScheme === "dark" || parsed.colorScheme === "system"
          ? parsed.colorScheme
          : "system",
    };
  } catch {
    return fallback;
  }
}

export function EditorApp({
  examples,
  defaultConfig,
}: {
  examples: Record<LocaleId, string>;
  defaultConfig: ResumeConfig;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const document = readStoredDocument(examples, defaultConfig);
    useEditorStore.setState({
      source: document.source,
      config: document.config,
      selectedSectionId: null,
      leftPanelWidth: document.leftPanelWidth,
      rightPanelWidth: document.rightPanelWidth,
      colorScheme: document.colorScheme,
    });
    setReady(true);
    return useEditorStore.subscribe((state) => {
      window.localStorage.setItem(
        EDITOR_STORAGE_KEY,
        JSON.stringify({
          source: state.source,
          config: state.config,
          leftPanelWidth: state.leftPanelWidth,
          rightPanelWidth: state.rightPanelWidth,
          colorScheme: state.colorScheme,
        }),
      );
    });
  }, [defaultConfig, examples]);

  if (!ready) {
    return <div className="h-screen bg-background" />;
  }

  return <EditorShell examples={examples} />;
}

function EditorShell({ examples }: { examples: Record<LocaleId, string> }) {
  const locale = useUiLocale();
  const ui = useUi();
  useColorScheme();
  const workspaceRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const leftPanelWidth = useEditorStore((state) => state.leftPanelWidth);
  const rightPanelWidth = useEditorStore((state) => state.rightPanelWidth);
  const setLeftPanelWidth = useEditorStore((state) => state.setLeftPanelWidth);
  const setRightPanelWidth = useEditorStore((state) => state.setRightPanelWidth);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dataset.uiLocale = locale;
  }, [locale]);

  const workspaceWidth = () => workspaceRef.current?.clientWidth ?? 1280;

  const setLeft = (width: number) => {
    setLeftPanelWidth(clampPanelWidth("left", width, rightPanelWidth, workspaceWidth()));
  };
  const setRight = (width: number) => {
    setRightPanelWidth(clampPanelWidth("right", width, leftPanelWidth, workspaceWidth()));
  };

  return (
    <div
      data-ui-locale={locale}
      lang={locale}
      className="flex h-screen min-w-[1180px] flex-col bg-background text-foreground"
    >
      <EditorToolbar examples={examples} />
      <div ref={workspaceRef} className="flex min-h-0 flex-1">
        <section
          className="relative min-h-0 shrink-0 overflow-visible bg-chrome"
          style={{ width: leftPanelWidth }}
        >
          <ContentPanel />
          <FloatingOutline scrollRootRef={previewRef} />
          <ResizeHandle
            side="left"
            value={leftPanelWidth}
            min={PANEL_LAYOUT.left.min}
            max={PANEL_LAYOUT.left.max}
            label={ui.resizeContent}
            onChange={setLeft}
            onReset={() => setLeft(PANEL_LAYOUT.left.default)}
          />
        </section>
        <section className="relative min-h-0 min-w-0 flex-1">
          <div ref={previewRef} className="desk-canvas h-full overflow-auto">
            <A4Preview />
          </div>
        </section>
        <section
          className="relative min-h-0 shrink-0 bg-chrome"
          style={{ width: rightPanelWidth }}
        >
          <ResizeHandle
            side="right"
            value={rightPanelWidth}
            min={PANEL_LAYOUT.right.min}
            max={PANEL_LAYOUT.right.max}
            label={ui.resizeDesign}
            onChange={setRight}
            onReset={() => setRight(PANEL_LAYOUT.right.default)}
          />
          <DesignPanel />
        </section>
      </div>
    </div>
  );
}
