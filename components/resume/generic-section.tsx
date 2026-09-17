import { formatDateRange } from "@/core/parser";
import type { CustomSection, GenericSection, LocaleDefinition } from "@/core/schema";
import { BulletList, ResumeInline } from "./bullet-list";
import { ContentBlocks } from "./content-blocks";
import { Spread } from "./spread";

export function GenericBody({
  section,
  locale,
}: {
  section: GenericSection | CustomSection;
  locale: LocaleDefinition;
}) {
  const blocks = section.blocks ?? [];

  if (section.items.length === 0) {
    if (blocks.length === 0) return null;
    return (
      <div data-box data-keep-together="true">
        <ContentBlocks blocks={blocks} />
      </div>
    );
  }

  return (
    <div>
      <ContentBlocks blocks={blocks} />
      {section.items.map((item) => {
        const dates = formatDateRange(item.startDate, item.endDate, locale.id, locale.labels.present);
        return (
          <article
            key={item.title}
            className="resume-item"
            data-outline-title={item.title}
            data-outline-depth="2"
            data-box
            data-keep-together="true"
          >
            <div className="resume-item-header">
              <Spread
                left={<h3 className="resume-item-title">{item.title}</h3>}
                right={dates}
                rightTone="text"
              />
              {item.subtitle ? <p className="resume-item-subtitle">{item.subtitle}</p> : null}
            </div>
            {item.description ? (
              <p className="resume-body">
                <ResumeInline text={item.description} spans={item.descriptionSpans} />
              </p>
            ) : null}
            {item.highlights ? (
              <BulletList items={item.highlights} richItems={item.richHighlights} />
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
