import type { SkillsLayout, SkillsSection } from "@/core/schema";

export function SkillsBody({
  section,
  layout,
}: {
  section: SkillsSection;
  layout: SkillsLayout;
}) {
  return (
    <div className="resume-skills" data-layout={layout}>
      {section.groups.map((group) => (
        <div
          key={group.name || group.items.join("-")}
          className="resume-skill-group"
          data-box
          data-keep-together="true"
        >
          {group.name ? <div className="resume-skill-name">{group.name}</div> : null}
          <div className="resume-skill-items">{group.items.join(" / ")}</div>
        </div>
      ))}
    </div>
  );
}
