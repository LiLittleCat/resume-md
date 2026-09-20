import { formatDateRange } from "@/core/parser";
import type { ExperienceItem, ExperienceLayout, LocaleDefinition } from "@/core/schema";
import { BulletList, ResumeInline } from "./bullet-list";
import { MarkdownBlocks } from "./markdown-blocks";
import { StrongMeta } from "./strong-meta";

export function ExperienceBody({
  items,
  layout,
  locale,
}: {
  items: ExperienceItem[];
  layout: ExperienceLayout;
  locale: LocaleDefinition;
}) {
  return (
    <div>
      {items.map((item, index) => (
        <article
          key={`${index}-${item.company}-${item.startDate?.raw ?? ""}`}
          className="resume-item"
          data-outline-title={item.company}
          data-outline-depth="2"
          data-box
          data-keep-together="true"
        >
          <ExperienceHeader item={item} layout={layout} locale={locale} />
          {item.blocks ? (
            <MarkdownBlocks blocks={item.blocks} />
          ) : item.description ? (
            <p className="resume-body">
              <ResumeInline text={item.description} spans={item.descriptionSpans} />
            </p>
          ) : null}
          {!item.blocks && item.responsibilities && item.responsibilities.length > 0 ? (
            <BulletList
              items={item.responsibilities}
              richItems={item.richResponsibilities}
            />
          ) : null}
          {!item.blocks && item.achievements && item.achievements.length > 0 ? (
            <BulletList items={item.achievements} richItems={item.richAchievements} />
          ) : null}
        </article>
      ))}
    </div>
  );
}

function ExperienceHeader({
  item,
  layout,
  locale,
}: {
  item: ExperienceItem;
  layout: ExperienceLayout;
  locale: LocaleDefinition;
}) {
  const dates = formatDateRange(item.startDate, item.endDate, locale.id, locale.labels.present);
  const meta = [dates, item.location].filter(Boolean).join(" · ");
  const fields = item.metaFields?.length
    ? item.metaFields
    : item.position
      ? [item.position]
      : [];

  if (layout === "stacked") {
    return (
      <div className="resume-item-header">
        <h3 className="resume-item-title">{item.company}</h3>
        {fields.map((field, index) => (
          <p className="resume-item-subtitle" key={`${field}-${index}`}>
            <ResumeInline text={field} spans={item.richMetaFields?.[index]} />
          </p>
        ))}
        {meta ? (
          <p className="resume-stacked-meta resume-date">
            <StrongMeta text={meta} strong={item.datesStrong} />
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="resume-item-header">
      <div
        className="resume-experience-heading"
        style={{ gridTemplateColumns: `repeat(${fields.length + 1}, minmax(0, 1fr)) max-content` }}
      >
        <h3 className="resume-item-title resume-experience-company">{item.company}</h3>
        {fields.map((field, index) => (
          <p
            className="resume-item-subtitle resume-experience-field"
            key={`${field}-${index}`}
          >
            <ResumeInline text={field} spans={item.richMetaFields?.[index]} />
          </p>
        ))}
        {meta ? (
          <div className="resume-spread-meta resume-experience-meta">
            <StrongMeta text={meta} strong={item.datesStrong} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
