import type { ContentBlock } from "@/core/schema";
import { BulletList, ResumeInline } from "./bullet-list";

export function ContentBlocks({
  blocks,
  paragraphClassName = "resume-paragraph",
}: {
  blocks: ContentBlock[];
  paragraphClassName?: string;
}) {
  return blocks.map((block, index) => {
    if (block.type === "paragraph") {
      return block.items.map((item, itemIndex) => (
        <p key={`${index}-${itemIndex}-${item}`} className={paragraphClassName}>
          <ResumeInline text={item} spans={block.spans?.[itemIndex]} />
        </p>
      ));
    }
    if (block.type === "unordered-list") {
      return <BulletList key={`${index}-ul`} items={block.items} richItems={block.spans} />;
    }
    return (
      <ol
        key={`${index}-ol`}
        className="resume-bullets resume-numbered-list"
        start={block.start}
      >
        {block.items.map((item, itemIndex) => (
          <li key={`${itemIndex}-${item}`} className="resume-bullet">
            <ResumeInline text={item} spans={block.spans?.[itemIndex]} />
          </li>
        ))}
      </ol>
    );
  });
}
