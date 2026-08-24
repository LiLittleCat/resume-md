"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import type { PanelSide } from "./panel-layout";

export function ResizeHandle({
  side,
  value,
  min,
  max,
  label,
  onChange,
  onReset,
}: {
  side: PanelSide;
  value: number;
  min: number;
  max: number;
  label: string;
  onChange: (width: number) => void;
  onReset: () => void;
}) {
  const drag = useRef<{ startX: number; startValue: number } | null>(null);

  const applyDelta = (clientX: number) => {
    const current = drag.current;
    if (!current) return;
    const delta = clientX - current.startX;
    const next = side === "left" ? current.startValue + delta : current.startValue - delta;
    onChange(Math.round(Math.min(max, Math.max(min, next))));
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      tabIndex={0}
      data-side={side}
      className={cn(
        "group/resize absolute top-0 z-20 h-full w-3 touch-none outline-none",
        "cursor-col-resize",
        side === "left" ? "-right-1.5" : "-left-1.5",
        "focus-visible:[&_[data-slot=resize-line]]:bg-primary",
      )}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        drag.current = { startX: event.clientX, startValue: value };
        event.currentTarget.setPointerCapture(event.pointerId);
        document.documentElement.dataset.resizing = "true";
      }}
      onPointerMove={(event) => {
        if (!drag.current) return;
        applyDelta(event.clientX);
      }}
      onPointerUp={(event) => {
        if (!drag.current) return;
        applyDelta(event.clientX);
        drag.current = null;
        delete document.documentElement.dataset.resizing;
      }}
      onLostPointerCapture={() => {
        drag.current = null;
        delete document.documentElement.dataset.resizing;
      }}
      onDoubleClick={(event) => {
        event.preventDefault();
        onReset();
      }}
      onKeyDown={(event) => {
        const step = event.shiftKey ? 32 : 8;
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          onChange(value + (side === "left" ? -step : step));
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          onChange(value + (side === "left" ? step : -step));
        } else if (event.key === "Home") {
          event.preventDefault();
          onChange(min);
        } else if (event.key === "End") {
          event.preventDefault();
          onChange(max);
        } else if (event.key === "Enter") {
          event.preventDefault();
          onReset();
        }
      }}
    >
      <span
        data-slot="resize-line"
        className={cn(
          "absolute top-0 h-full w-px bg-border transition-[background-color] duration-150",
          "group-hover/resize:bg-primary group-active/resize:bg-primary",
          side === "left" ? "right-1.5" : "left-1.5",
        )}
      />
      <span
        aria-hidden
        className={cn(
          "absolute top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-foreground/20 transition-[background-color] duration-150",
          "group-hover/resize:bg-primary group-active/resize:bg-primary",
          side === "left" ? "right-[4px]" : "left-[4px]",
        )}
      />
    </div>
  );
}
