import type { InlineSpan } from "@/core/schema";

export function ResumeInline({ text, spans }: { text: string; spans?: InlineSpan[] }) {
  if (!spans || spans.length === 0) return text;
  return spans.map((span, index) => {
    const key = `${index}-${span.text}-${span.href ?? ""}`;
    const content = span.strong ? <strong>{span.text}</strong> : span.text;
    return span.href ? (
      <a className="resume-inline-link" href={span.href} key={key}>
        {content}
      </a>
    ) : (
      <span key={key}>{content}</span>
    );
  });
}

export function BulletList({
  items,
  richItems,
  paginated = false,
}: {
  items: string[];
  richItems?: InlineSpan[][];
  paginated?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <ul className="resume-bullets">
      {items.map((item, index) => (
        <li
          key={item}
          className="resume-bullet"
          data-box={paginated ? "project-bullet" : undefined}
          data-keep-together={paginated ? "true" : undefined}
        >
          <ResumeInline text={item} spans={richItems?.[index]} />
        </li>
      ))}
    </ul>
  );
}
