import { describe, expect, it } from "vitest";
import { collectPageOffsets, packPages, sameOffsets } from "@/core/layout";

describe("packPages", () => {
  it("keeps a title with the following box when requested", () => {
    const pages = packPages(
      [
        { id: "title", height: 20, keepWithNext: true },
        { id: "item", height: 80 },
        { id: "item-2", height: 80 },
      ],
      100,
    );
    expect(pages[0]?.boxIds).toEqual(["title", "item"]);
    expect(pages[1]?.boxIds).toEqual(["item-2"]);
  });

  it("moves a keep-with-next pair to the next page instead of splitting it", () => {
    const pages = packPages(
      [
        { id: "a", height: 70 },
        { id: "title", height: 20, keepWithNext: true },
        { id: "item", height: 40 },
      ],
      100,
    );
    expect(pages[0]?.boxIds).toEqual(["a"]);
    expect(pages[1]?.boxIds).toEqual(["title", "item"]);
  });
});

describe("collectPageOffsets", () => {
  it("does not grow forever when page height is zero", () => {
    const offsets = collectPageOffsets({
      boxTops: [0, 40],
      pages: [{ boxIds: ["0", "1"], height: 80 }],
      contentHeight: 800,
      pageHeight: 0,
    });
    expect(offsets).toEqual([0]);
  });

  it("fills remaining scroll height with whole pages", () => {
    const offsets = collectPageOffsets({
      boxTops: [0],
      pages: [{ boxIds: ["0"], height: 100 }],
      contentHeight: 250,
      pageHeight: 100,
    });
    expect(offsets).toEqual([0, 100, 200]);
  });
});

describe("sameOffsets", () => {
  it("treats subpixel jitter as unchanged", () => {
    expect(sameOffsets([0, 400.2], [0, 400.4])).toBe(true);
    expect(sameOffsets([0, 400], [0, 401])).toBe(false);
  });
});
