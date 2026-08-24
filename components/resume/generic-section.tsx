import { formatDateRange } from "@/core/parser";
import type { CustomSection, GenericSection, LocaleDefinition } from "@/core/schema";
import { BulletList } from "./bullet-list";
import { Spread } from "./spread";

export function GenericBody({
  section,
  locale,
}: {
  section: GenericSection | CustomSection;
  locale: LocaleDefinition;
}) {
  const blocks = (section.blocks ?? []).filter((block) => block.trim().length > 0);

  if (section.items.length === 0) {
    if (blocks.length === 0) return null;
    return (
      <div data-box data-keep-together="true">
        {blocks.map((block) => (
          <p key={block} className="resume-paragraph">
            {block}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div>
      {blocks.map((block) => (
        <p key={block} className="resume-paragraph">
          {block}
        </p>
      ))}
      {section.items.map((item) => {
        const dates = formatDateRange(item.startDate, item.endDate, locale.id, locale.labels.present);
        return (
          <article key={item.title} className="resume-item" data-box data-keep-together="true">
            <div className="resume-item-header">
              <Spread left={<p className="resume-item-title">{item.title}</p>} right={dates} />
              {item.subtitle ? <p className="resume-item-subtitle">{item.subtitle}</p> : null}
            </div>
            {item.description ? <p className="resume-body">{item.description}</p> : null}
            {item.highlights ? <BulletList items={item.highlights} /> : null}
          </article>
        );
      })}
    </div>
  );
}
