import { formatDateRange } from "@/core/parser";
import type { EducationItem, LocaleDefinition } from "@/core/schema";
import { BulletList } from "./bullet-list";
import { Spread } from "./spread";

export function EducationBody({
  items,
  locale,
}: {
  items: EducationItem[];
  locale: LocaleDefinition;
}) {
  return (
    <div>
      {items.map((item) => {
        const dates = formatDateRange(item.startDate, item.endDate, locale.id, locale.labels.present);
        const subtitle = [item.major, item.degree].filter(Boolean).join(" · ");
        return (
          <article
            key={`${item.school}-${dates}`}
            className="resume-item"
            data-box
            data-keep-together="true"
          >
            <div className="resume-item-header">
              <Spread left={<p className="resume-item-title">{item.school}</p>} right={dates} />
              {subtitle ? <p className="resume-item-subtitle">{subtitle}</p> : null}
            </div>
            {item.details ? <BulletList items={item.details} /> : null}
          </article>
        );
      })}
    </div>
  );
}
