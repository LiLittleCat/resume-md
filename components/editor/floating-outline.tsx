"use client";

import type { RefObject } from "react";
import { useMemo } from "react";
import { ListTree } from "lucide-react";
import { compileResume } from "@/core/compile";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/editor-store";
import { isOutlineEntrySelected, outlineEntries } from "./outline";
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
      return outlineEntries(compileResume({ source, config }).resume);
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
                        const target = scrollRootRef.current?.querySelector<HTMLElement>(
                          `.resume-paper [data-section-title="${cssAttr(entry.sectionTitle)}"]`,
                        );
                        target?.scrollIntoView({ block: "center", behavior: "smooth" });
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

function cssAttr(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}
