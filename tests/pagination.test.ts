import { describe, expect, it } from "vitest";
import { packPages } from "@/core/layout";

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
