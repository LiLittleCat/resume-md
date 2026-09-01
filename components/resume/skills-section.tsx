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
          <SkillItems group={group} />
        </div>
      ))}
    </div>
  );
}

function SkillItems({ group }: { group: SkillsSection["groups"][number] }) {
  if (group.listType === "ordered") {
    return (
      <ol className="resume-skill-items resume-skill-list" start={group.listStart}>
        {group.items.map((item, index) => (
          <li key={`${index}-${item}`}>{item}</li>
        ))}
      </ol>
    );
  }

  if (group.listType === "unordered") {
    return (
      <ul className="resume-skill-items resume-skill-list">
        {group.items.map((item, index) => (
          <li key={`${index}-${item}`}>{item}</li>
        ))}
      </ul>
    );
  }

  return <div className="resume-skill-items">{group.items.join(" / ")}</div>;
}
