import { describe, expect, it } from "vitest";
import { isOutlineEntrySelected, type OutlineEntry } from "@/components/editor/outline";

const parent: OutlineEntry = {
  title: "工作经历",
  depth: 1,
  sectionId: "experience",
  sectionTitle: "工作经历",
};

const child: OutlineEntry = {
  title: "示例科技有限公司",
  depth: 2,
  sectionId: "experience",
  sectionTitle: "工作经历",
};

describe("isOutlineEntrySelected", () => {
  it("selects only the parent when a section is chosen from the preview", () => {
    const selection = {
      sectionId: "experience" as const,
      sectionTitle: "工作经历",
      heading: null,
    };
    expect(isOutlineEntrySelected(parent, selection)).toBe(true);
    expect(isOutlineEntrySelected(child, selection)).toBe(false);
  });

  it("selects only the exact heading chosen from the outline", () => {
    const selection = {
      sectionId: "experience" as const,
      sectionTitle: "工作经历",
      heading: { title: child.title, depth: 2 as const },
    };
    expect(isOutlineEntrySelected(parent, selection)).toBe(false);
    expect(isOutlineEntrySelected(child, selection)).toBe(true);
  });
});
