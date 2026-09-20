import { formatDateRange } from "@/core/parser";
import type { CustomSection, GenericSection, LocaleDefinition } from "@/core/schema";
import { BulletList, ResumeInline } from "./bullet-list";
import { ContentBlocks } from "./content-blocks";
import { Spread } from "./spread";
import { StrongMeta } from "./strong-meta";

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

  if (section.itemLayout === "list") {
    return (
      <div>
        <ContentBlocks blocks={blocks} />
        <ul className="resume-bullets">
          {section.items.map((item, index) => {
            const dates = formatDateRange(item.startDate, item.endDate, locale.id, locale.labels.present);
            return (
              <li
                key={`${index}-${item.title}`}
                className="resume-bullet"
                data-outline-title={item.title}
                data-outline-depth="2"
                data-box
                data-keep-together="true"
              >
                <Spread
                  left={
                    <span className="resume-list-title">
                      <ResumeInline text={item.title} spans={item.titleSpans} />
                    </span>
                  }
                  right={dates ? <StrongMeta text={dates} strong={item.datesStrong} /> : null}
                  rightTone="text"
                />
                {item.description ? (
                  <p className="resume-body">
                    <ResumeInline text={item.description} spans={item.descriptionSpans} />
                  </p>
                ) : null}
                {item.highlights ? (
                  <BulletList items={item.highlights} richItems={item.richHighlights} />
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <ContentBlocks blocks={blocks} />
      {section.items.map((item, index) => {
        const dates = formatDateRange(item.startDate, item.endDate, locale.id, locale.labels.present);
        return (
          <article
            key={`${index}-${item.title}`}
            className="resume-item"
            data-outline-title={item.title}
            data-outline-depth="2"
            data-box
            data-keep-together="true"
          >
            <div className="resume-item-header">
              <Spread
                left={
                  <h3 className="resume-item-title">
                    <ResumeInline text={item.title} spans={item.titleSpans} />
                  </h3>
                }
                middle={
                  item.subtitle ? (
                    <p className="resume-item-subtitle">
                      <ResumeInline text={item.subtitle} spans={item.subtitleSpans} />
                    </p>
                  ) : null
                }
                right={dates ? <StrongMeta text={dates} strong={item.datesStrong} /> : null}
                rightTone="text"
              />
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
