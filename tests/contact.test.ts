import { describe, expect, it } from "vitest";
import { contactLineStarts } from "@/components/resume/contact";

describe("contactLineStarts", () => {
  it("marks the first contact on each wrapped row", () => {
    expect(
      contactLineStarts({
        containerWidth: 100,
        itemWidths: [30, 30, 30],
        separatorWidth: 5,
        outerGap: 5,
        innerGap: 5,
      }),
    ).toEqual([0, 2]);
  });

  it("keeps all contacts on one row when they fit", () => {
    expect(
      contactLineStarts({
        containerWidth: 120,
        itemWidths: [30, 30, 30],
        separatorWidth: 5,
        outerGap: 5,
        innerGap: 5,
      }),
    ).toEqual([0]);
  });
});
