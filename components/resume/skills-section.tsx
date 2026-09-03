import type { InlineSpan, SkillsLayout, SkillsSection } from "@/core/schema";

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
          data-outline-title={group.name || undefined}
          data-outline-depth={group.name ? "2" : undefined}
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
          <li key={`${index}-${item}`}>
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
      <ul className="resume-skill-items resume-skill-list">
        {group.items.map((item, index) => (
          <li key={`${index}-${item}`}>
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

  return <div className="resume-skill-items">{group.items.join(" / ")}</div>;
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
        <InlineSpans spans={paragraph} />
      </span>
    ));
  }
  if (!spans || spans.length === 0) return item;
  return <InlineSpans spans={spans} />;
}

function InlineSpans({ spans }: { spans: InlineSpan[] }) {
  return spans.map((span, index) =>
    span.strong ? <strong key={`${index}-${span.text}`}>{span.text}</strong> : span.text,
  );
}
