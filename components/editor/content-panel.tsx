"use client";

import { useEffect, useRef } from "react";
import { FileText } from "lucide-react";
import type { LocaleId } from "@/core/schema";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useEditorStore } from "@/store/editor-store";
import { useUi, useUiLocale } from "./use-ui";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const ui = useUi();
  const uiLocale = useUiLocale();

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || !headingFocus) return;
    const needle = `${"#".repeat(headingFocus.depth)} ${headingFocus.title}`;
    const index = source.indexOf(needle);
    if (index < 0) return;
    const line = source.slice(0, index).split("\n").length;
    textarea.focus();
    textarea.setSelectionRange(index, index + needle.length);
    textarea.scrollTop = Math.max(0, (line - 3) * 22);
  }, [headingFocus, source]);

  return (
    <div className="flex h-full min-h-0 flex-col">
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
                <FileText className="size-3.5" />
              </Button>
            }
          />
          <TooltipContent side="bottom">{ui.loadExample}</TooltipContent>
        </Tooltip>
      </header>
      <textarea
        ref={textareaRef}
        value={source}
        onChange={(event) => setSource(event.target.value)}
        spellCheck={false}
        aria-label={ui.markdownAria}
        className="min-h-0 flex-1 resize-none border-0 bg-transparent px-4 py-3 font-mono text-[13px] leading-[22px] text-foreground/80 outline-none"
      />
    </div>
  );
}
