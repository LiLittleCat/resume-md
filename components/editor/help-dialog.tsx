"use client";

import { CircleHelp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { UiCopy } from "@/locales/ui";

export function HelpDialog({ ui }: { ui: UiCopy }) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button type="button" variant="ghost" size="icon-sm" aria-label={ui.help} />
        }
      >
        <CircleHelp className="size-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{ui.helpTitle}</DialogTitle>
          <DialogDescription>{ui.helpIntro}</DialogDescription>
        </DialogHeader>
        <ol className="grid gap-3">
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
        <p className="rounded-lg bg-muted/60 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
          {ui.helpStorage}
        </p>
      </DialogContent>
    </Dialog>
  );
}
