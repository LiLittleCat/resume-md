import { describe, expect, it } from "vitest";
import { segmentedGridCellStyle } from "@/components/settings/controls";

describe("segmentedGridCellStyle", () => {
  it("uses the group border for the outside and draws only internal grid seams", () => {
    expect(segmentedGridCellStyle(0, 2)).toMatchObject({
      borderRadius: 0,
      borderLeftWidth: 0,
      borderTopWidth: 0,
    });
    expect(segmentedGridCellStyle(1, 2)).toMatchObject({
      borderLeftWidth: 1,
      borderTopWidth: 0,
    });
    expect(segmentedGridCellStyle(2, 2)).toMatchObject({
      borderLeftWidth: 0,
      borderTopWidth: 1,
    });
    expect(segmentedGridCellStyle(3, 2)).toMatchObject({
      borderLeftWidth: 1,
      borderTopWidth: 1,
    });
  });

  it("leaves single-row segmented controls unchanged", () => {
    expect(segmentedGridCellStyle(0, undefined)).toBeUndefined();
  });
});
