import type { SummarySection } from "@/core/schema";
import { ContentBlocks } from "./content-blocks";

export function SummaryBody({ section }: { section: SummarySection }) {
  return (
    <div data-box="summary-body" data-keep-together="true">
      <ContentBlocks blocks={section.content} />
    </div>
  );
}
