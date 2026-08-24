import { describe, expect, it } from "vitest";
import { clampPanelWidth, PANEL_LAYOUT } from "@/components/editor/panel-layout";

describe("clampPanelWidth", () => {
  it("keeps the preview a usable width", () => {
    const left = clampPanelWidth("left", 900, 220, 1400);
    expect(left).toBeLessThanOrEqual(1400 - 220 - PANEL_LAYOUT.previewMin);
    expect(left).toBeGreaterThanOrEqual(PANEL_LAYOUT.left.min);
  });

  it("does not go below the minimum", () => {
    expect(clampPanelWidth("right", 10, 320, 1280)).toBe(PANEL_LAYOUT.right.min);
  });
});
