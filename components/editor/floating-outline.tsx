"use client";

import type { RefObject } from "react";
import { useMemo } from "react";
import { ListTree } from "lucide-react";
import { cn } from "@/lib/utils";
import { compileResumeWithAvatarAssets } from "@/lib/avatar-assets";
import { useEditorStore } from "@/store/editor-store";
import {
  centeredPreviewScrollTop,
  isOutlineEntrySelected,
  outlineEntries,
  targetStartsInPage,
} from "./outline";
import { useUi } from "./use-ui";

export function FloatingOutline({
  scrollRootRef,
}: {
  scrollRootRef: RefObject<HTMLDivElement | null>;
}) {
  const source = useEditorStore((state) => state.source);
  const config = useEditorStore((state) => state.config);
  const selectedSectionId = useEditorStore((state) => state.selectedSectionId);
  const selectedSectionTitle = useEditorStore((state) => state.selectedSectionTitle);
  const headingFocus = useEditorStore((state) => state.headingFocus);
  const selectSection = useEditorStore((state) => state.selectSection);
  const focusHeading = useEditorStore((state) => state.focusHeading);
  const ui = useUi();

  const outline = useMemo(() => {
    try {
      return outlineEntries(
        compileResumeWithAvatarAssets({ source, config }, window.localStorage).resume,
      );
    } catch {
      return [];
    }
  }, [source, config]);

  if (outline.length === 0) return null;

  return (
    <aside className="group/outline absolute top-24 right-2 z-30">
      <div className="overflow-hidden rounded-xl border border-border bg-chrome/92 shadow-lg backdrop-blur-md">
        <button
          type="button"
          aria-label={ui.outline}
          className="flex size-10 items-center justify-center text-muted-foreground group-hover/outline:hidden group-focus-within/outline:hidden"
        >
          <ListTree className="size-4" />
        </button>
        <div className="hidden w-56 group-hover/outline:block group-focus-within/outline:block">
          <div className="flex h-10 items-center gap-2 px-2.5 text-muted-foreground">
            <ListTree className="size-4 shrink-0" />
            <span className="ui-kicker truncate">{ui.outline}</span>
          </div>
          <nav className="max-h-[min(60vh,28rem)] overflow-y-auto px-1.5 pb-2">
            <ol className="flex flex-col">
              {outline.map((entry, index) => {
                const selected = isOutlineEntrySelected(entry, {
                  sectionId: selectedSectionId,
                  sectionTitle: selectedSectionTitle,
                  heading: headingFocus,
                });
                return (
                  <li key={`${index}-${entry.sectionId}-${entry.depth}-${entry.title}`}>
                    <button
                      type="button"
                      title={entry.title}
                      onClick={() => {
                        selectSection(entry.sectionId, entry.sectionTitle);
                        focusHeading(entry.title, entry.depth);
                        scrollToOutlineEntry(scrollRootRef.current, entry);
                      }}
                      className={cn(
                        "flex w-full rounded-md py-1 text-left leading-5 transition-[background-color,color,transform] duration-150 active:scale-[0.99]",
                        entry.depth === 1
                          ? "px-2 text-[12px] font-medium"
                          : "px-2 pl-5 text-[11px]",
                        selected
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                      )}
                    >
                      <span className="min-w-0 truncate">{entry.title}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
      </div>
    </aside>
  );
}

function scrollToOutlineEntry(
  scrollRoot: HTMLDivElement | null,
  entry: { title: string; depth: 1 | 2; sectionTitle: string },
) {
  if (!scrollRoot) return;

  const sectionSelector = `[data-section-title="${cssAttr(entry.sectionTitle)}"]`;
  const targetSelector = `[data-outline-title="${cssAttr(entry.title)}"][data-outline-depth="${entry.depth}"]`;
  const selector =
    entry.depth === 1
      ? `.resume-paper ${sectionSelector}${targetSelector}`
      : `.resume-paper ${sectionSelector} ${targetSelector}`;
  const candidates = scrollRoot.querySelectorAll<HTMLElement>(selector);

  for (const candidate of candidates) {
    const page = candidate.closest<HTMLElement>("[data-preview-page]");
    const pageViewport = page?.querySelector<HTMLElement>("[data-page-viewport]");
    if (!pageViewport) continue;

    const targetRect = candidate.getBoundingClientRect();
    const pageRect = pageViewport.getBoundingClientRect();
    if (!targetStartsInPage(targetRect.top, pageRect.top, pageRect.bottom)) continue;

    const scrollRect = scrollRoot.getBoundingClientRect();
    scrollRoot.scrollTo({
      top: centeredPreviewScrollTop({
        currentScrollTop: scrollRoot.scrollTop,
        viewportTop: scrollRect.top,
        viewportHeight: scrollRoot.clientHeight,
        targetTop: targetRect.top,
        targetHeight: targetRect.height,
      }),
      behavior: "smooth",
    });
    return;
  }
}

function cssAttr(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}
