import { describe, expect, it } from "vitest";
import {
  centeredPreviewScrollTop,
  isOutlineEntrySelected,
  targetStartsInPage,
  type OutlineEntry,
} from "@/components/editor/outline";

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

describe("preview outline scrolling", () => {
  it("selects only the page slice where the heading starts", () => {
    expect(targetStartsInPage(120, 100, 300)).toBe(true);
    expect(targetStartsInPage(320, 100, 300)).toBe(false);
    expect(targetStartsInPage(99.5, 100, 300)).toBe(true);
  });

  it("centers a target by scrolling only the preview viewport", () => {
    expect(
      centeredPreviewScrollTop({
        currentScrollTop: 500,
        viewportTop: 80,
        viewportHeight: 600,
        targetTop: 480,
        targetHeight: 40,
      }),
    ).toBe(620);
  });
});
