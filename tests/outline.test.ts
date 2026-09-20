import { describe, expect, it } from "vitest";
import {
  centeredPreviewScrollTop,
  isOutlineEntrySelected,
  isTargetFullyVisible,
  previewAnchorAtOffset,
  previewClickTarget,
  previewTargetTop,
  sourceOffsetForAnchor,
  sourceSelectionForAnchor,
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

  it("maps a document offset onto the visible page slice", () => {
    expect(
      previewTargetTop({
        relativeTop: 0,
        pageStart: 0,
        viewportTop: 80,
        scale: 1,
      }),
    ).toBe(80);
    expect(
      previewTargetTop({
        relativeTop: 200,
        pageStart: 200,
        viewportTop: 80,
        scale: 0.5,
      }),
    ).toBe(80);
  });

  it("skips scrolling when the target is already fully visible", () => {
    expect(
      isTargetFullyVisible({
        targetTop: 120,
        targetBottom: 160,
        viewportTop: 80,
        viewportBottom: 680,
      }),
    ).toBe(true);
    expect(
      isTargetFullyVisible({
        targetTop: 700,
        targetBottom: 740,
        viewportTop: 80,
        viewportBottom: 680,
      }),
    ).toBe(false);
  });
});

describe("previewAnchorAtOffset", () => {
  const source = `---
name: 刘毅
---

# 工作经历

## 天翼交通科技有限公司

智慧交通 | 高级研发工程师 | 2022.10 - 2026.07

## 开源项目

- **[Resume MD](https://resume.yl.do)** | 2024.06 - 至今
Markdown 简历编辑工具。
- **[GeoTools](https://geotools.yl.do)**
`;

  it("maps front matter to the resume header", () => {
    expect(previewAnchorAtOffset(source, source.indexOf("name: 刘毅"))).toEqual({ kind: "header" });
  });

  it("maps a job heading and its body to that item", () => {
    expect(previewAnchorAtOffset(source, source.indexOf("天翼交通科技有限公司"))).toEqual({
      kind: "heading",
      title: "天翼交通科技有限公司",
      depth: 2,
      sectionTitle: "工作经历",
    });
    expect(previewAnchorAtOffset(source, source.indexOf("高级研发工程师"))).toEqual({
      kind: "heading",
      title: "天翼交通科技有限公司",
      depth: 2,
      sectionTitle: "工作经历",
    });
  });

  it("maps an open-source list item, including its unindented description", () => {
    expect(previewAnchorAtOffset(source, source.indexOf("Resume MD"))).toEqual({
      kind: "heading",
      title: "Resume MD",
      depth: 2,
      sectionTitle: "开源项目",
    });
    expect(previewAnchorAtOffset(source, source.indexOf("Markdown 简历编辑工具"))).toEqual({
      kind: "heading",
      title: "Resume MD",
      depth: 2,
      sectionTitle: "开源项目",
    });
    expect(previewAnchorAtOffset(source, source.indexOf("GeoTools"))).toEqual({
      kind: "heading",
      title: "GeoTools",
      depth: 2,
      sectionTitle: "开源项目",
    });
  });
});

describe("sourceOffsetForAnchor", () => {
  const source = `---
name: 刘毅
---

# 工作经历

## 天翼交通科技有限公司

智慧交通 | 高级研发工程师 | 2022.10 - 2026.07

## 开源项目

- **[Resume MD](https://resume.yl.do)** | 2024.06 - 至今
Markdown 简历编辑工具。
- **[GeoTools](https://geotools.yl.do)**
`;

  it("maps a preview click back to the matching markdown line", () => {
    expect(sourceOffsetForAnchor(source, { kind: "header" })).toBe(source.indexOf("name: 刘毅"));
    expect(
      sourceOffsetForAnchor(source, {
        kind: "heading",
        title: "工作经历",
        depth: 1,
        sectionTitle: "工作经历",
      }),
    ).toBe(source.indexOf("# 工作经历"));
    expect(
      sourceOffsetForAnchor(source, {
        kind: "heading",
        title: "天翼交通科技有限公司",
        depth: 2,
        sectionTitle: "工作经历",
      }),
    ).toBe(source.indexOf("## 天翼交通科技有限公司"));
    expect(
      sourceOffsetForAnchor(source, {
        kind: "heading",
        title: "开源项目",
        depth: 1,
        sectionTitle: "开源项目",
      }),
    ).toBe(source.indexOf("## 开源项目"));
    expect(
      sourceOffsetForAnchor(source, {
        kind: "heading",
        title: "Resume MD",
        depth: 2,
        sectionTitle: "开源项目",
      }),
    ).toBe(source.indexOf("- **[Resume MD]"));
  });

  it("round-trips editor offsets through preview anchors", () => {
    for (const needle of ["name: 刘毅", "天翼交通科技有限公司", "高级研发工程师", "Resume MD", "Markdown 简历"]) {
      const offset = source.indexOf(needle);
      const anchor = previewAnchorAtOffset(source, offset);
      const start = sourceOffsetForAnchor(source, anchor);
      expect(previewAnchorAtOffset(source, start)).toEqual(anchor);
    }
  });

  it("selects the visible title inside the markdown line", () => {
    expect(sourceSelectionForAnchor(source, { kind: "header" })).toEqual({
      start: source.indexOf("name: 刘毅"),
      end: source.indexOf("\n", source.indexOf("name: 刘毅")),
    });
    expect(
      sourceSelectionForAnchor(source, {
        kind: "heading",
        title: "Resume MD",
        depth: 2,
        sectionTitle: "开源项目",
      }),
    ).toEqual({
      start: source.indexOf("Resume MD"),
      end: source.indexOf("Resume MD") + "Resume MD".length,
    });
  });
});

describe("previewClickTarget", () => {
  it("uses the innermost outline node, not the section heading", () => {
    expect(
      previewClickTarget({
        inHeader: false,
        outlineTitle: "Resume MD",
        outlineDepth: "2",
        sectionId: "openSource",
        sectionTitle: "开源项目",
      }),
    ).toEqual({
      sectionId: "openSource",
      anchor: {
        kind: "heading",
        title: "Resume MD",
        depth: 2,
        sectionTitle: "开源项目",
      },
    });
  });

  it("maps the resume header to front matter", () => {
    expect(previewClickTarget({ inHeader: true })).toEqual({
      sectionId: null,
      anchor: { kind: "header" },
    });
  });

  it("ignores clicks on page chrome", () => {
    expect(previewClickTarget({ inHeader: false })).toBeNull();
  });
});
