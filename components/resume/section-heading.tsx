import type { ResumeIcon } from "@/core/schema";
import { ResumeGlyph } from "./resume-icon";

export function SectionHeading({
  title,
  icon,
  showIcon,
  transform,
  rule,
}: {
  title: string;
  icon?: ResumeIcon;
  showIcon: boolean;
  transform: "none" | "uppercase";
  rule: boolean;
}) {
  return (
    <h2
      className="resume-section-title"
      data-box
      data-keep-with-next="true"
      data-transform={transform}
      data-rule={rule ? "true" : "false"}
    >
      {showIcon && icon ? <ResumeGlyph icon={icon} /> : null}
      <span className="resume-section-title-text">{title}</span>
    </h2>
  );
}
