"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function IconToggleGroup({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5">
      {children}
    </div>
  );
}

export function IconToggle({
  pressed,
  label,
  onPressed,
  children,
}: {
  pressed: boolean;
  label: string;
  onPressed: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      onClick={onPressed}
      className={cn(
        "flex size-7 items-center justify-center rounded-md text-[11px] font-medium transition-[transform,background-color,color] duration-150",
        "active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
        pressed
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
