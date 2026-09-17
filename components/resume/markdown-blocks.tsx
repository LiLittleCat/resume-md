import type { ProjectBlock } from "@/core/schema";
import { BulletList, ResumeInline } from "./bullet-list";

export function MarkdownBlocks({
  blocks,
  paginated = false,
}: {
  blocks: ProjectBlock[];
  paginated?: boolean;
}) {
  return blocks.map((block, index) => {
    const isList = block.type === "unordered-list" || block.type === "ordered-list";
    return (
      <div
        key={`${index}-${block.heading ?? block.type}`}
        className="resume-project-block resume-markdown-block"
        data-box={paginated && !isList ? "project-block" : undefined}
        data-keep-together={paginated && !isList ? "true" : undefined}
      >
        {block.heading ? (
          <h4
            className="resume-subhead"
            data-box={paginated && isList ? "project-subhead" : undefined}
            data-keep-with-next={paginated && isList ? "true" : undefined}
          >
            {block.heading}
          </h4>
        ) : null}
        {block.type === "paragraph"
          ? block.items.map((item, itemIndex) => (
              <p key={`${itemIndex}-${item}`} className="resume-body">
                <ResumeInline text={item} spans={block.spans?.[itemIndex]} />
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
        {block.type === "unordered-list" ? (
          <BulletList items={block.items} richItems={block.spans} paginated={paginated} />
        ) : null}
        {block.type === "ordered-list" ? (
          <ol className="resume-bullets resume-numbered-list" start={block.start}>
            {block.items.map((item, itemIndex) => (
              <li
                key={`${itemIndex}-${item}`}
                className="resume-bullet"
                data-box={paginated ? "project-bullet" : undefined}
                data-keep-together={paginated ? "true" : undefined}
              >
                <ResumeInline text={item} spans={block.spans?.[itemIndex]} />
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    );
  });
}
