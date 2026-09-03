import { createElement } from "react";
import type { IconProvider, ResumeIcon } from "@/core/schema";
import { getLucideIcon, getPhosphorIcon, isFilledResumeIcon } from "./icons";

export function ResumeGlyph({
  icon,
  provider = "phosphor",
  label,
}: {
  icon: ResumeIcon;
  provider?: IconProvider;
  label?: string;
}) {
  const filled = provider === "lucide" && isFilledResumeIcon(icon);
  return (
    <span
      className="resume-icon"
      data-icon-provider={provider}
      data-filled={filled ? "true" : undefined}
      aria-hidden={label ? undefined : true}
      aria-label={label}
    >
      {provider === "phosphor"
        ? createElement(getPhosphorIcon(icon), { weight: "regular" })
        : createElement(getLucideIcon(icon))}
    </span>
  );
}
