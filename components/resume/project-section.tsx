import { formatDateRange } from "@/core/parser";
import type { LocaleDefinition, ProjectItem, ProjectLayout } from "@/core/schema";
import { BulletList } from "./bullet-list";
import { Spread } from "./spread";

export function ProjectsBody({
  items,
  layout,
  locale,
}: {
  items: ProjectItem[];
  layout: ProjectLayout;
  locale: LocaleDefinition;
}) {
  return (
    <div>
      {items.map((item) => (
        <article
          key={`${item.name}-${item.startDate?.raw ?? ""}`}
          className="resume-item"
          data-box
          data-keep-together="true"
        >
          <ProjectHeader item={item} layout={layout} locale={locale} />
          {item.description ? <p className="resume-body">{item.description}</p> : null}
          {item.techStack && item.techStack.length > 0 ? (
            <p className="resume-tech">{item.techStack.join("  ")}</p>
          ) : null}
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

function ProjectHeader({
  item,
  layout,
  locale,
}: {
  item: ProjectItem;
  layout: ProjectLayout;
  locale: LocaleDefinition;
}) {
  const dates = formatDateRange(item.startDate, item.endDate, locale.id, locale.labels.present);

  if (layout === "compact") {
    return (
      <div className="resume-item-header">
        <Spread
          left={
            <p className="resume-item-title">
              {item.name}
              {item.role ? ` · ${item.role}` : ""}
            </p>
          }
          right={dates}
        />
      </div>
    );
  }

  return (
    <div className="resume-item-header">
      <Spread left={<p className="resume-item-title">{item.name}</p>} right={dates} />
      {item.role ? <p className="resume-item-subtitle">{item.role}</p> : null}
    </div>
  );
}
