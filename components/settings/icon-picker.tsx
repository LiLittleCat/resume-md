"use client";

import { createElement, useState } from "react";
import { recommendedIconsFor, allResumeIcons } from "@/core/icons";
import type { ResumeIcon, SectionId } from "@/core/schema";
import { getLucideIcon } from "@/components/resume";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useUi } from "@/components/editor/use-ui";

function TriggerIcon(icon: ResumeIcon) {
  return createElement(getLucideIcon(icon), { className: "size-3.5" });
}

export function IconPicker({
  sectionId,
  value,
  onChange,
}: {
  sectionId: SectionId;
  value?: ResumeIcon;
  onChange: (icon: ResumeIcon) => void;
}) {
  const [viewAll, setViewAll] = useState(false);
  const recommended = recommendedIconsFor(sectionId);
  const icons = viewAll ? allResumeIcons() : recommended;
  const ui = useUi();

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" size="sm" className="w-full justify-start gap-2">
            {value ? TriggerIcon(value) : null}
            <span className="truncate">{value ?? ui.inherited}</span>
          </Button>
        }
      />
      <PopoverContent className="w-64 p-3" align="start">
        <div className="mb-2 flex items-center justify-between">
          <p className="ui-kicker text-muted-foreground">
            {viewAll ? ui.allIcons : ui.recommended}
          </p>
          <button
            type="button"
            className="text-xs text-primary hover:underline"
            onClick={() => setViewAll((current) => !current)}
          >
            {viewAll ? ui.recommended : ui.viewAll}
          </button>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {icons.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => onChange(icon)}
              className={cn(
                "flex aspect-square items-center justify-center rounded-md border border-transparent text-foreground transition-[transform,background-color] duration-150 active:scale-[0.96]",
                value === icon ? "border-border bg-muted" : "hover:bg-muted/70",
              )}
              aria-label={icon}
              title={icon}
            >
              {TriggerIcon(icon)}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
