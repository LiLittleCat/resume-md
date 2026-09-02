import { formatDateRange } from "@/core/parser";
import type { ExperienceItem, ExperienceLayout, LocaleDefinition } from "@/core/schema";
import { BulletList } from "./bullet-list";

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
      {items.map((item) => (
        <article
          key={`${item.company}-${item.startDate?.raw ?? ""}`}
          className="resume-item"
          data-outline-title={item.company}
          data-outline-depth="2"
          data-box
          data-keep-together="true"
        >
          <ExperienceHeader item={item} layout={layout} locale={locale} />
          {item.description ? <p className="resume-body">{item.description}</p> : null}
          {item.responsibilities && item.responsibilities.length > 0 ? (
            <>
              <div className="resume-subhead">{locale.labels.responsibilities}</div>
              <BulletList items={item.responsibilities} />
            </>
          ) : null}
          {item.achievements && item.achievements.length > 0 ? (
            <>
              <div className="resume-subhead">{locale.labels.achievements}</div>
              <BulletList items={item.achievements} />
            </>
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

  if (layout === "stacked") {
    return (
      <div className="resume-item-header">
        <p className="resume-item-title">{item.company}</p>
        {item.position ? <p className="resume-item-subtitle">{item.position}</p> : null}
        {meta ? <p className="resume-stacked-meta resume-date">{meta}</p> : null}
      </div>
    );
  }

  return (
    <div className="resume-item-header">
      <div className="resume-experience-heading">
        <p className="resume-item-title resume-experience-company">{item.company}</p>
        {item.position ? (
          <p className="resume-item-subtitle resume-experience-position">{item.position}</p>
        ) : null}
        {meta ? <div className="resume-spread-meta resume-experience-meta">{meta}</div> : null}
      </div>
    </div>
  );
}
