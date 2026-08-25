"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import type { LocaleId, ResumeConfig } from "@/core/schema";
import { A4Preview } from "@/components/preview/a4-preview";
import { DesignPanel } from "@/components/settings/design-panel";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
import { clampPanelRatio, clampPanelWidth, PANEL_LAYOUT } from "./panel-layout";
import { formatPreviewScale } from "@/lib/preview-scale";
import { ResizeHandle } from "./resize-handle";
import { useColorScheme } from "./use-color-scheme";
import { usePreviewZoom } from "./use-preview-zoom";
import { useUi, useUiLocale } from "./use-ui";

const PERSIST_DEBOUNCE_MS = 300;

function readLeftPanelRatio(value: number | undefined): number {
  return typeof value === "number"
    ? clampPanelRatio(value)
    : PANEL_LAYOUT.left.defaultRatio;
}

function readRightPanelWidth(value: number | undefined): number {
  if (typeof value !== "number" || value === 300) return PANEL_LAYOUT.right.default;
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
      leftPanelRatio: readLeftPanelRatio(library.chrome.leftPanelRatio),
      rightPanelWidth: readRightPanelWidth(library.chrome.rightPanelWidth),
      designPanelCollapsed: library.chrome.designPanelCollapsed ?? false,
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
        leftPanelRatio: state.leftPanelRatio,
        rightPanelWidth: state.rightPanelWidth,
        designPanelCollapsed: state.designPanelCollapsed,
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
  const [workspaceWidth, setWorkspaceWidth] = useState(1280);
  const hudScale = usePreviewZoom(previewRef);
  const leftPanelRatio = useEditorStore((state) => state.leftPanelRatio);
  const rightPanelWidth = useEditorStore((state) => state.rightPanelWidth);
  const designPanelCollapsed = useEditorStore((state) => state.designPanelCollapsed);
  const setLeftPanelRatio = useEditorStore((state) => state.setLeftPanelRatio);
  const setRightPanelWidth = useEditorStore((state) => state.setRightPanelWidth);
  const setDesignPanelCollapsed = useEditorStore((state) => state.setDesignPanelCollapsed);
  const [autoExpandOverride, setAutoExpandOverride] = useState(false);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dataset.uiLocale = locale;
  }, [locale]);

  useLayoutEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace) return;
    const measure = () => setWorkspaceWidth(workspace.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(workspace);
    return () => observer.disconnect();
  }, []);

  const clampedRightPanelWidth = clampPanelWidth(
    "right",
    rightPanelWidth,
    PANEL_LAYOUT.previewMin,
    workspaceWidth,
  );
  const designPanelNeedsCollapse = workspaceWidth < PANEL_LAYOUT.right.autoCollapseBelow;
  useEffect(() => {
    if (!designPanelNeedsCollapse) setAutoExpandOverride(false);
  }, [designPanelNeedsCollapse]);
  const effectiveDesignPanelCollapsed =
    designPanelCollapsed || (designPanelNeedsCollapse && !autoExpandOverride);
  const effectiveRightPanelWidth = effectiveDesignPanelCollapsed
    ? 0
    : clampedRightPanelWidth;
  const mainWidth = Math.max(1, workspaceWidth - effectiveRightPanelWidth);
  const leftPanelWidth = clampPanelWidth(
    "left",
    mainWidth * leftPanelRatio,
    effectiveRightPanelWidth,
    workspaceWidth,
  );
  const leftPanelMax = Math.max(PANEL_LAYOUT.left.min, mainWidth - PANEL_LAYOUT.previewMin);
  const rightPanelMax = Math.max(
    PANEL_LAYOUT.right.min,
    workspaceWidth - PANEL_LAYOUT.left.min - PANEL_LAYOUT.previewMin,
  );

  const setLeft = (width: number) => {
    const nextWidth = clampPanelWidth(
      "left",
      width,
      effectiveRightPanelWidth,
      workspaceWidth,
    );
    setLeftPanelRatio(clampPanelRatio(nextWidth / mainWidth));
  };
  const setRight = (width: number) => {
    setRightPanelWidth(
      clampPanelWidth("right", width, PANEL_LAYOUT.previewMin, workspaceWidth),
    );
  };

  const collapseDesignPanel = () => {
    setAutoExpandOverride(false);
    setDesignPanelCollapsed(true);
  };

  const expandDesignPanel = () => {
    setDesignPanelCollapsed(false);
    setAutoExpandOverride(designPanelNeedsCollapse);
  };

  return (
    <div
      data-ui-locale={locale}
      lang={locale}
      className="flex h-screen min-w-[680px] flex-col bg-background text-foreground"
    >
      <EditorToolbar />
      <div
        ref={workspaceRef}
        data-slot="editor-workspace"
        className="relative flex min-h-0 flex-1"
      >
        <section
          data-slot="content-panel"
          className="relative min-h-0 shrink-0 overflow-visible bg-chrome"
          style={{ width: leftPanelWidth }}
        >
          <ContentPanel examples={examples} />
          <FloatingOutline scrollRootRef={previewRef} />
          <ResizeHandle
            side="left"
            value={leftPanelWidth}
            min={PANEL_LAYOUT.left.min}
            max={leftPanelMax}
            label={ui.resizeContent}
            onChange={setLeft}
            onReset={() => setLeftPanelRatio(PANEL_LAYOUT.left.defaultRatio)}
          />
        </section>
        <section data-slot="preview-panel" className="relative min-h-0 min-w-0 flex-1">
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
          data-slot="design-panel"
          data-collapsed={effectiveDesignPanelCollapsed}
          className="relative min-h-0 shrink-0 bg-chrome"
          style={{ width: effectiveRightPanelWidth }}
        >
          {!effectiveDesignPanelCollapsed ? (
            <>
              <ResizeHandle
                side="right"
                value={clampedRightPanelWidth}
                min={PANEL_LAYOUT.right.min}
                max={rightPanelMax}
                label={ui.resizeDesign}
                onChange={setRight}
                onReset={() => setRight(PANEL_LAYOUT.right.default)}
              />
              <DesignPanel onCollapse={collapseDesignPanel} />
            </>
          ) : null}
        </section>
        {effectiveDesignPanelCollapsed ? (
          <aside
            data-slot="floating-design-toggle"
            className="absolute top-24 right-2 z-30 overflow-hidden rounded-xl border border-border bg-chrome/92 shadow-lg backdrop-blur-md"
          >
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-10 rounded-xl"
                    aria-label={ui.expandDesign}
                    onClick={expandDesignPanel}
                  >
                    <SlidersHorizontal className="size-4" />
                  </Button>
                }
              />
              <TooltipContent side="left">{ui.expandDesign}</TooltipContent>
            </Tooltip>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
