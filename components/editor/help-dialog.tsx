"use client";

import { ChevronRight, CircleHelp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildResumeTemplate } from "@/locales/resume-guide";
import type { UiCopy } from "@/locales/ui";
import { CopyTextButton } from "./copy-text-button";

export function HelpDialog({ ui }: { ui: UiCopy }) {
  const guide = ui.guide;
  const template = buildResumeTemplate(guide);

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button type="button" variant="ghost" size="icon-sm" aria-label={ui.help} title={ui.help} />
        }
      >
        <CircleHelp className="size-4" />
      </DialogTrigger>
      <DialogContent className="flex h-[min(44rem,calc(100dvh-2rem))] flex-col overflow-hidden sm:max-w-2xl">
        <DialogHeader className="shrink-0 pr-6">
          <DialogTitle>{ui.helpTitle}</DialogTitle>
          <DialogDescription>{ui.helpIntro}</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="syntax" className="min-h-0 flex-1 gap-4">
          <TabsList className="w-full shrink-0" aria-label={ui.helpTitle}>
            <TabsTrigger value="start">{guide.quickStart}</TabsTrigger>
            <TabsTrigger value="syntax">{guide.syntax}</TabsTrigger>
            <TabsTrigger value="template">{guide.template}</TabsTrigger>
          </TabsList>
          <TabsContent value="start" className="min-h-0 overflow-y-auto overscroll-contain px-1 pb-1">
            <ol className="grid gap-4">
              {ui.helpSteps.map((step, index) => (
                <li key={step.title} className="grid grid-cols-[1.5rem_1fr] gap-2.5">
                  <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                    {index + 1}
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-medium">{step.title}</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-5 rounded-lg bg-muted/60 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
              {ui.helpStorage}
            </p>
          </TabsContent>
          <TabsContent value="syntax" className="min-h-0 overflow-y-auto overscroll-contain px-1 pb-1">
            <p className="mb-4 rounded-lg bg-muted/60 px-3 py-2.5 text-sm leading-relaxed">
              {guide.structure}
            </p>
            <div className="divide-y divide-border rounded-lg border border-border">
              {guide.topics.map((topic) => (
                <details key={topic.id} className="group">
                  <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md p-3 text-sm font-medium outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
                    <ChevronRight className="size-3.5 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
                    {topic.title}
                  </summary>
                  <div className="space-y-3 px-3 pb-3 sm:pl-8">
                    <p className="text-sm leading-relaxed text-muted-foreground">{topic.description}</p>
                    {topic.example && (
                      <pre className="overflow-x-auto rounded-md bg-muted/50 p-3 font-mono text-xs leading-relaxed" tabIndex={0} aria-label={topic.title}>
                        <code>{topic.example}</code>
                      </pre>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="template" className="flex min-h-0 flex-col gap-3">
            <div className="flex shrink-0 flex-wrap items-start justify-between gap-3 px-1">
              <p className="min-w-48 flex-1 text-sm leading-relaxed text-muted-foreground">{guide.templateIntro}</p>
              <CopyTextButton key={guide.copyTemplate} text={template} label={guide.copyTemplate} guide={guide} />
            </div>
            <pre className="min-h-0 flex-1 overflow-auto overscroll-contain rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs leading-relaxed" tabIndex={0} aria-label={guide.template}>
              <code>{template}</code>
            </pre>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
