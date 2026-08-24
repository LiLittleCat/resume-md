import { createElement } from "react";
import type { ResumeIcon } from "@/core/schema";
import { getLucideIcon } from "./icons";

export function ResumeGlyph({
  icon,
  label,
}: {
  icon: ResumeIcon;
  label?: string;
}) {
  return (
    <span className="resume-icon" aria-hidden={label ? undefined : true} aria-label={label}>
      {createElement(getLucideIcon(icon))}
    </span>
  );
}
