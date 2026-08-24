import type { SummarySection } from "@/core/schema";

export function SummaryBody({ section }: { section: SummarySection }) {
  return (
    <div data-box="summary-body" data-keep-together="true">
      {section.content.map((paragraph) => (
        <p key={paragraph} className="resume-paragraph">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
