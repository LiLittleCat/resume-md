import { describe, expect, it } from "vitest";
import {
  clampPanelRatio,
  clampPanelWidth,
  PANEL_LAYOUT,
} from "@/components/editor/panel-layout";

describe("clampPanelWidth", () => {
  it("keeps the preview a usable width", () => {
    const left = clampPanelWidth("left", 900, 220, 1400);
    expect(left).toBeLessThanOrEqual(1400 - 220 - PANEL_LAYOUT.previewMin);
    expect(left).toBeGreaterThanOrEqual(PANEL_LAYOUT.left.min);
  });

  it("does not go below the minimum", () => {
    expect(clampPanelWidth("right", 10, 320, 1280)).toBe(PANEL_LAYOUT.right.min);
  });

  it("uses all available width instead of a fixed panel maximum", () => {
    expect(clampPanelWidth("left", 1400, 260, 2560)).toBe(1400);
    expect(clampPanelWidth("right", 900, PANEL_LAYOUT.previewMin, 2560)).toBe(900);
  });

  it("keeps persisted split ratios valid", () => {
    expect(clampPanelRatio(-1)).toBe(0);
    expect(clampPanelRatio(0.5)).toBe(0.5);
    expect(clampPanelRatio(2)).toBe(1);
  });
});
