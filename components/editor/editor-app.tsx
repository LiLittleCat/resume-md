"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { LocaleId, ResumeConfig } from "@/core/schema";
import { A4Preview } from "@/components/preview/a4-preview";
import { DesignPanel } from "@/components/settings/design-panel";
import { persistLibraryOrToast } from "@/components/library/persist";
import {
  hydrateResumeLibrary,
  updateResumeChrome,
  updateResumeDocument,
  type ResumeLibrary,
} from "@/lib/resume-storage";
import { useEditorStore } from "@/store/editor-store";
import { ContentPanel } from "./content-panel";
import { EditorToolbar } from "./editor-toolbar";
import { FloatingOutline } from "./floating-outline";
import { clampPanelWidth, PANEL_LAYOUT } from "./panel-layout";
import { formatPreviewScale } from "@/lib/preview-scale";
import { ResizeHandle } from "./resize-handle";
import { useColorScheme } from "./use-color-scheme";
import { usePreviewZoom } from "./use-preview-zoom";
import { useUi, useUiLocale } from "./use-ui";

const PERSIST_DEBOUNCE_MS = 300;

function readPanelWidth(side: "left" | "right", value: number | undefined): number {
  if (typeof value !== "number") return PANEL_LAYOUT[side].default;
  if (side === "left" && value === 320) return PANEL_LAYOUT.left.default;
  if (side === "right" && value === 300) return PANEL_LAYOUT.right.default;
  return value;
}

export function EditorApp({
  examples,
  defaultConfig,
}: {
  examples: Record<LocaleId, string>;
  defaultConfig: ResumeConfig;
}) {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const library = hydrateResumeLibrary(window.localStorage, {
      source: examples["zh-CN"],
      config: defaultConfig,
    });
    const active = library.activeId ? library.documents[library.activeId] : undefined;
    if (!active) {
      router.replace("/resumes");
      return;
    }

    useEditorStore.setState({
      source: active.source,
      config: active.config,
      selectedSectionId: null,
      selectedSectionTitle: null,
      leftPanelWidth: readPanelWidth("left", library.chrome.leftPanelWidth),
      rightPanelWidth: readPanelWidth("right", library.chrome.rightPanelWidth),
      colorScheme: library.chrome.colorScheme,
    });

    const libraryRef = { current: library };
    const activeId = active.id;
    let lastSerialized = JSON.stringify({ source: active.source, config: active.config });
    let timer = 0;

    const flush = () => {
      persistLibraryOrToast(libraryRef.current, useEditorStore.getState().config.locale);
    };

    const unsubscribe = useEditorStore.subscribe((state) => {
      const serialized = JSON.stringify({ source: state.source, config: state.config });
      let next: ResumeLibrary = libraryRef.current;
      if (serialized !== lastSerialized) {
        lastSerialized = serialized;
        next = updateResumeDocument(next, activeId, {
          source: state.source,
          config: state.config,
        });
      }
      next = updateResumeChrome(next, {
        colorScheme: state.colorScheme,
        leftPanelWidth: state.leftPanelWidth,
        rightPanelWidth: state.rightPanelWidth,
      });
      libraryRef.current = next;
      window.clearTimeout(timer);
      timer = window.setTimeout(flush, PERSIST_DEBOUNCE_MS);
    });

    setReady(true);
    return () => {
      unsubscribe();
      window.clearTimeout(timer);
      flush();
    };
  }, [defaultConfig, examples, router]);

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
  const hudScale = usePreviewZoom(previewRef);
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
      <EditorToolbar />
      <div ref={workspaceRef} className="flex min-h-0 flex-1">
        <section
          className="relative min-h-0 shrink-0 overflow-visible bg-chrome"
          style={{ width: leftPanelWidth }}
        >
          <ContentPanel examples={examples} />
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
          {hudScale !== null ? (
            <div
              role="status"
              aria-live="polite"
              aria-label={`${ui.scale} ${formatPreviewScale(hudScale)}`}
              className="pointer-events-none absolute right-4 bottom-4 z-10 rounded-md bg-foreground px-2 py-1 text-[11px] tabular-nums text-background shadow-md"
            >
              {formatPreviewScale(hudScale)}
            </div>
          ) : null}
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
