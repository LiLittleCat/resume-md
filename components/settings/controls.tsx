"use client";

import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label className="ui-kicker text-muted-foreground">
          {label}
        </Label>
        {hint ? (
          <span className="font-mono text-[11px] text-muted-foreground tabular-nums">{hint}</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export function NumberSlider({
  value,
  min,
  max,
  step,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <Slider
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={(next) => {
        const resolved = Array.isArray(next) ? next[0] : next;
        if (typeof resolved === "number") onChange(resolved);
      }}
    />
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  columns,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  columns?: number;
}) {
  return (
    <ToggleGroup
      value={[value]}
      onValueChange={(next) => {
        const selected = next[0];
        if (selected) onChange(selected as T);
      }}
      variant="outline"
      size="sm"
      spacing={0}
      className={cn(
        "grid w-full [&_[data-pressed]]:bg-muted [&_[data-pressed]]:text-foreground [&_[aria-pressed=true]]:bg-muted",
      )}
      style={{ gridTemplateColumns: `repeat(${columns ?? options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => (
        <ToggleGroupItem key={option.value} value={option.value} className="px-1.5 text-[11px]">
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

export function PanelBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-3">
      <h3 className="ui-kicker text-primary">
        {title}
      </h3>
      {children}
    </section>
  );
}
