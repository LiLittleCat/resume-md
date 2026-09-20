import { formatDateRange } from "@/core/parser";
import type { LocaleDefinition, ProjectItem } from "@/core/schema";
import { BulletList } from "./bullet-list";
import { MarkdownBlocks } from "./markdown-blocks";
import { Spread } from "./spread";

export function ProjectsBody({
  items,
  locale,
}: {
  items: ProjectItem[];
  locale: LocaleDefinition;
}) {
  return (
    <div>
      {items.map((item, index) => (
        <article
          key={`${index}-${item.name}-${item.startDate?.raw ?? ""}`}
          className="resume-item resume-project-item"
          data-outline-title={item.name}
          data-outline-depth="2"
        >
          <ProjectHeader item={item} locale={locale} />
          {item.blocks ? (
            <MarkdownBlocks blocks={item.blocks} paginated />
          ) : (
            <LegacyProjectBody item={item} />
          )}
        </article>
      ))}
    </div>
  );
}

function LegacyProjectBody({ item }: { item: ProjectItem }) {
  return (
    <>
      {item.description ? (
        <p className="resume-body" data-box="project-description" data-keep-together="true">
          {item.description}
        </p>
      ) : null}
      {item.techStack && item.techStack.length > 0 ? (
        <p className="resume-tech" data-box="project-tech" data-keep-together="true">
          {item.techStack.join("  ")}
        </p>
      ) : null}
      {item.responsibilities && item.responsibilities.length > 0 ? (
        <BulletList items={item.responsibilities} paginated />
      ) : null}
      {item.achievements && item.achievements.length > 0 ? (
        <BulletList items={item.achievements} paginated />
      ) : null}
    </>
  );
}

function ProjectHeader({
  item,
  locale,
}: {
  item: ProjectItem;
  locale: LocaleDefinition;
}) {
  const dates = formatDateRange(item.startDate, item.endDate, locale.id, locale.labels.present);

  return (
    <div className="resume-item-header" data-box="project-header" data-keep-with-next="true">
      <Spread
        left={<h3 className="resume-item-title">{item.name}</h3>}
        middle={item.role ? <p className="resume-item-subtitle">{item.role}</p> : null}
        right={dates}
        rightTone="text"
      />
    </div>
  );
}
