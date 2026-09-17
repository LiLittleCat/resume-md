"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, FileInput } from "lucide-react";
import { useOverlayScrollbars } from "overlayscrollbars-react";
import type { LocaleId } from "@/core/schema";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/editor-store";
import { useUi, useUiLocale } from "./use-ui";

function resizeEditor(
  textarea: HTMLTextAreaElement | null,
  viewport: HTMLDivElement | null,
) {
  if (!textarea || !viewport) return;
  const scrollTop = viewport.scrollTop;
  textarea.style.height = "0px";
  textarea.style.height = `${Math.max(textarea.scrollHeight, viewport.clientHeight)}px`;
  textarea.scrollTop = 0;
  viewport.scrollTop = scrollTop;
}

const TAB_INDENT = "  ";

function applyTabIndent(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  outdent: boolean,
): { value: string; start: number; end: number } {
  const hasSelection = selectionStart !== selectionEnd;

  if (!outdent && !hasSelection) {
    const next = value.slice(0, selectionStart) + TAB_INDENT + value.slice(selectionEnd);
    const cursor = selectionStart + TAB_INDENT.length;
    return { value: next, start: cursor, end: cursor };
  }

  const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
  const lineEnd = value.indexOf("\n", selectionEnd) === -1 ? value.length : value.indexOf("\n", selectionEnd);
  const lines = value.slice(lineStart, lineEnd).split("\n");

  let startDelta = 0;
  let endDelta = 0;
  const newLines = lines.map((line, index) => {
    if (outdent) {
      const removed = line.match(/^ {1,2}/)?.[0] ?? "";
      if (index === 0) startDelta = -removed.length;
      endDelta -= removed.length;
      return line.slice(removed.length);
    }
    if (index === 0) startDelta = TAB_INDENT.length;
    endDelta += TAB_INDENT.length;
    return TAB_INDENT + line;
  });

  const next = value.slice(0, lineStart) + newLines.join("\n") + value.slice(lineEnd);
  return {
    value: next,
    start: Math.max(lineStart, selectionStart + startDelta),
    end: selectionEnd + endDelta,
  };
}

export function ContentPanel({
  examples,
}: {
  examples: Record<LocaleId, string>;
}) {
  const source = useEditorStore((state) => state.source);
  const config = useEditorStore((state) => state.config);
  const setSource = useEditorStore((state) => state.setSource);
  const loadDocument = useEditorStore((state) => state.loadDocument);
  const headingFocus = useEditorStore((state) => state.headingFocus);
  const scrollHostRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [initializeEditorScrollbars] = useOverlayScrollbars({
    defer: true,
    options: {
      overflow: { x: "hidden", y: "scroll" },
      scrollbars: {
        autoHide: "move",
        autoHideDelay: 500,
        theme: "os-theme-resume",
      },
    },
  });
  const ui = useUi();
  const uiLocale = useUiLocale();

  useEffect(() => {
    const target = scrollHostRef.current;
    const viewport = scrollViewportRef.current;
    if (!target || !viewport) return;
    initializeEditorScrollbars({ target, elements: { viewport } });
  }, [initializeEditorScrollbars]);

  useLayoutEffect(() => {
    resizeEditor(textareaRef.current, scrollViewportRef.current);
  }, [source]);

  useLayoutEffect(() => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(() => {
      resizeEditor(textareaRef.current, viewport);
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    const viewport = scrollViewportRef.current;
    if (!textarea || !viewport || !headingFocus) return;
    const needle = `${"#".repeat(headingFocus.depth)} ${headingFocus.title}`;
    const index = source.indexOf(needle);
    if (index < 0) return;
    const line = source.slice(0, index).split("\n").length;
    textarea.focus();
    textarea.setSelectionRange(index, index + needle.length);
    viewport.scrollTop = Math.max(0, (line - 3) * 23);
  }, [headingFocus, source]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-9 items-center border-b border-border px-3">
        <Link
          href="/resumes"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "-ml-1 text-muted-foreground hover:text-foreground",
          )}
        >
          <ChevronLeft className="size-3.5" />
          {ui.back}
        </Link>
      </div>
      <header className="flex h-11 items-center justify-between border-b border-border px-4">
        <p className="ui-kicker text-muted-foreground">{ui.content}</p>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={ui.loadExample}
                onClick={() =>
                  loadDocument(examples[uiLocale], {
                    ...config,
                    locale: uiLocale,
                  })
                }
              >
                <FileInput className="size-3.5" />
              </Button>
            }
          />
          <TooltipContent side="bottom">{ui.loadExample}</TooltipContent>
        </Tooltip>
      </header>
      <div
        ref={scrollHostRef}
        data-overlayscrollbars-initialize
        className="min-h-0 flex-1"
      >
        <div
          ref={scrollViewportRef}
          data-overlayscrollbars-initialize
          className="h-full overflow-x-hidden overflow-y-auto overscroll-contain"
        >
          <textarea
            ref={textareaRef}
            value={source}
            onChange={(event) => {
              resizeEditor(event.currentTarget, scrollViewportRef.current);
              setSource(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key !== "Tab") return;
              event.preventDefault();
              const textarea = event.currentTarget;
              const result = applyTabIndent(
                textarea.value,
                textarea.selectionStart,
                textarea.selectionEnd,
                event.shiftKey,
              );
              textarea.value = result.value;
              textarea.setSelectionRange(result.start, result.end);
              setSource(result.value);
              resizeEditor(textarea, scrollViewportRef.current);
            }}
            spellCheck={false}
            aria-label={ui.markdownAria}
            className="markdown-editor block w-full resize-none overflow-hidden border-0 bg-transparent px-4 py-3 text-[14px] leading-[23px] text-foreground/80 outline-none"
          />
        </div>
      </div>
    </div>
  );
}
