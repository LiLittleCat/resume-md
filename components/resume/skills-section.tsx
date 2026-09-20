import type { InlineSpan, SkillsLayout, SkillsSection } from "@/core/schema";
import { ResumeInline } from "./bullet-list";

export function SkillsBody({
  section,
  layout,
}: {
  section: SkillsSection;
  layout: SkillsLayout;
}) {
  return (
    <div className="resume-skills" data-layout={layout}>
      {section.groups.map((group, index) => (
        <div
          key={`${index}-${group.name || group.items.join("-")}`}
          className="resume-skill-group"
          data-outline-title={group.name || undefined}
          data-outline-depth={group.name ? "2" : undefined}
          data-box
          data-keep-together="true"
        >
          {group.name ? <h3 className="resume-skill-name">{group.name}</h3> : null}
          <SkillItems group={group} />
        </div>
      ))}
    </div>
  );
}

function SkillItems({ group }: { group: SkillsSection["groups"][number] }) {
  if (group.listType === "ordered") {
    return (
      <ol
        className="resume-bullets resume-numbered-list resume-skill-list resume-skill-items"
        start={group.listStart}
      >
        {group.items.map((item, index) => (
          <li key={`${index}-${item}`} className="resume-bullet">
            <SkillItemText
              item={item}
              spans={group.richItems?.[index]}
              paragraphs={group.richItemParagraphs?.[index]}
            />
          </li>
        ))}
      </ol>
    );
  }

  if (group.listType === "unordered") {
    return (
      <ul className="resume-bullets resume-skill-list resume-skill-items">
        {group.items.map((item, index) => (
          <li key={`${index}-${item}`} className="resume-bullet">
            <SkillItemText
              item={item}
              spans={group.richItems?.[index]}
              paragraphs={group.richItemParagraphs?.[index]}
            />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="resume-skill-items">
      {group.items.map((item, index) => (
        <span key={`${index}-${item}`}>
          {index > 0 ? " / " : null}
          <ResumeInline text={item} spans={group.richItems?.[index]} />
        </span>
      ))}
    </div>
  );
}

function SkillItemText({
  item,
  spans,
  paragraphs,
}: {
  item: string;
  spans: InlineSpan[] | undefined;
  paragraphs: InlineSpan[][] | undefined;
}) {
  if (paragraphs && paragraphs.length > 1) {
    return paragraphs.map((paragraph, index) => (
      <span className="resume-skill-paragraph" key={`${index}-${paragraph[0]?.text ?? ""}`}>
        <ResumeInline text={paragraph.map((span) => span.text).join("")} spans={paragraph} />
      </span>
    ));
  }
  if (!spans || spans.length === 0) return item;
  return <ResumeInline text={item} spans={spans} />;
}
