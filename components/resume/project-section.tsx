import { formatDateRange } from "@/core/parser";
import type { LocaleDefinition, ProjectBlock, ProjectItem } from "@/core/schema";
import { BulletList } from "./bullet-list";
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
      {items.map((item) => (
        <article
          key={`${item.name}-${item.startDate?.raw ?? ""}`}
          className="resume-item resume-project-item"
          data-outline-title={item.name}
          data-outline-depth="2"
        >
          <ProjectHeader item={item} locale={locale} />
          {item.blocks ? <ProjectBlocks blocks={item.blocks} /> : <LegacyProjectBody item={item} locale={locale} />}
        </article>
      ))}
    </div>
  );
}

function ProjectBlocks({ blocks }: { blocks: ProjectBlock[] }) {
  return blocks.map((block, index) => {
    const isList = block.type === "unordered-list" || block.type === "ordered-list";
    return (
    <div
      key={`${index}-${block.heading ?? block.type}`}
      className="resume-project-block"
      data-box={isList ? undefined : "project-block"}
      data-keep-together={isList ? undefined : "true"}
    >
      {block.heading ? (
        <div
          className="resume-subhead"
          data-box={isList ? "project-subhead" : undefined}
          data-keep-with-next={isList ? "true" : undefined}
        >
          {block.heading}
        </div>
      ) : null}
      {block.type === "paragraph"
        ? block.items.map((item, itemIndex) => (
            <p key={`${itemIndex}-${item}`} className="resume-body">
              {item}
            </p>
          ))
        : null}
      {block.type === "tags" ? (
        <div className="resume-tech">
          {block.items.map((item, itemIndex) => (
            <span key={`${itemIndex}-${item}`} className="resume-tech-item">
              {item}
            </span>
          ))}
        </div>
      ) : null}
      {block.type === "unordered-list" ? <BulletList items={block.items} paginated /> : null}
      {block.type === "ordered-list" ? (
        <ol className="resume-bullets resume-numbered-list" start={block.start}>
          {block.items.map((item, itemIndex) => (
            <li
              key={`${itemIndex}-${item}`}
              className="resume-bullet"
              data-box="project-bullet"
              data-keep-together="true"
            >
              {item}
            </li>
          ))}
        </ol>
      ) : null}
    </div>
    );
  });
}

function LegacyProjectBody({ item, locale }: { item: ProjectItem; locale: LocaleDefinition }) {
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
        <>
          <div className="resume-subhead" data-box="project-subhead" data-keep-with-next="true">
            {locale.labels.responsibilities}
          </div>
          <BulletList items={item.responsibilities} paginated />
        </>
      ) : null}
      {item.achievements && item.achievements.length > 0 ? (
        <>
          <div className="resume-subhead" data-box="project-subhead" data-keep-with-next="true">
            {locale.labels.achievements}
          </div>
          <BulletList items={item.achievements} paginated />
        </>
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
        left={<p className="resume-item-title">{item.name}</p>}
        middle={item.role ? <p className="resume-item-subtitle">{item.role}</p> : null}
        right={dates}
        rightTone="text"
      />
    </div>
  );
}
