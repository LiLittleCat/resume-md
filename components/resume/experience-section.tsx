import { formatDateRange } from "@/core/parser";
import type { ExperienceItem, ExperienceLayout, LocaleDefinition } from "@/core/schema";
import { BulletList } from "./bullet-list";
import { Spread } from "./spread";

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

  if (layout === "compact") {
    return (
      <div className="resume-item-header">
        <Spread
          left={
            <p className="resume-item-title">
              {item.company}
              {item.position ? ` · ${item.position}` : ""}
            </p>
          }
          right={dates}
        />
      </div>
    );
  }

  if (layout === "stacked") {
    return (
      <div className="resume-item-header">
        <p className="resume-item-title">{item.company}</p>
        {item.position ? <p className="resume-item-subtitle">{item.position}</p> : null}
        <p className="resume-stacked-meta">
          {[dates, item.location].filter(Boolean).join(" · ")}
        </p>
      </div>
    );
  }

  return (
    <div className="resume-item-header">
      <Spread left={<p className="resume-item-title">{item.company}</p>} right={dates} />
      <Spread
        left={item.position ? <p className="resume-item-subtitle">{item.position}</p> : null}
        right={item.location}
      />
    </div>
  );
}
