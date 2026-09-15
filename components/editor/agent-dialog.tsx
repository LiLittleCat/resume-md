"use client";

import { Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { buildAgentPrompt } from "@/locales/resume-guide";
import type { UiCopy } from "@/locales/ui";
import { CopyTextButton } from "./copy-text-button";

export function AgentDialog({ ui }: { ui: UiCopy }) {
  const guide = ui.guide;
  const prompt = buildAgentPrompt(guide);

  return (
    <Dialog>
      <DialogTrigger render={<Button type="button" variant="ghost" size="sm" />}>
        <Terminal className="size-3.5" />
        <span>for agent</span>
      </DialogTrigger>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="shrink-0 pr-6">
          <DialogTitle>{guide.agentTitle}</DialogTitle>
          <DialogDescription className="leading-relaxed">{guide.agentIntro}</DialogDescription>
        </DialogHeader>
        <ol className="grid shrink-0 gap-2 rounded-lg border border-border bg-muted/30 p-3">
          {guide.agentSteps.map((step, index) => (
            <li key={step} className="flex gap-2.5 text-sm leading-relaxed">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-background text-xs font-medium text-muted-foreground ring-1 ring-border">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span aria-hidden="true" className="text-xs font-medium text-muted-foreground">{guide.promptLabel}</span>
            <CopyTextButton key={guide.copyPrompt} text={prompt} label={guide.copyPrompt} guide={guide} />
          </div>
          <textarea
            readOnly
            aria-label={guide.promptLabel}
            value={prompt}
            spellCheck={false}
            className="h-[min(38dvh,20rem)] min-h-32 w-full resize-none rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
