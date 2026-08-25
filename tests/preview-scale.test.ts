import { describe, expect, it } from "vitest";
import {
  applyKeyboardZoom,
  applyWheelZoom,
  clampPreviewScale,
  fitPreviewScale,
  formatPreviewScale,
  isZoomWheel,
  parseZoomKey,
  PREVIEW_SCALE,
} from "@/lib/preview-scale";

describe("clampPreviewScale", () => {
  it("keeps values inside the zoom range", () => {
    expect(clampPreviewScale(0.1)).toBe(PREVIEW_SCALE.min);
    expect(clampPreviewScale(4)).toBe(PREVIEW_SCALE.max);
    expect(clampPreviewScale(0.82)).toBe(0.82);
  });

  it("falls back when the value is not a number", () => {
    expect(clampPreviewScale(Number.NaN)).toBe(PREVIEW_SCALE.default);
  });
});

describe("applyWheelZoom", () => {
  it("zooms in when the wheel moves up", () => {
    expect(applyWheelZoom(1, -44)).toBeGreaterThan(1);
  });

  it("zooms out when the wheel moves down", () => {
    expect(applyWheelZoom(1, 44)).toBeLessThan(1);
  });

  it("does not leave the allowed range", () => {
    expect(applyWheelZoom(PREVIEW_SCALE.min, 800)).toBe(PREVIEW_SCALE.min);
    expect(applyWheelZoom(PREVIEW_SCALE.max, -800)).toBe(PREVIEW_SCALE.max);
  });
});

describe("applyKeyboardZoom", () => {
  it("steps in, out, and back to the default", () => {
    expect(applyKeyboardZoom(1, "in")).toBeCloseTo(1.1);
    expect(applyKeyboardZoom(1.1, "out")).toBeCloseTo(1);
    expect(applyKeyboardZoom(1.4, "reset")).toBe(PREVIEW_SCALE.default);
  });
});

describe("fitPreviewScale", () => {
  it("fits a page within both available dimensions", () => {
    expect(
      fitPreviewScale({
        containerWidth: 900,
        containerHeight: 1000,
        pageWidth: 800,
        pageHeight: 1200,
      }),
    ).toBe(0.78);
  });

  it("keeps very narrow previews inside the supported scale range", () => {
    expect(
      fitPreviewScale({
        containerWidth: 200,
        containerHeight: 800,
        pageWidth: 800,
        pageHeight: 1200,
      }),
    ).toBe(PREVIEW_SCALE.min);
  });
});

describe("zoom input", () => {
  it("treats ctrl or command as a zoom modifier", () => {
    expect(isZoomWheel({ ctrlKey: true, metaKey: false })).toBe(true);
    expect(isZoomWheel({ ctrlKey: false, metaKey: true })).toBe(true);
    expect(isZoomWheel({ ctrlKey: false, metaKey: false })).toBe(false);
  });

  it("maps command/ctrl plus minus and zero", () => {
    expect(parseZoomKey({ key: "=", ctrlKey: true, metaKey: false })).toBe("in");
    expect(parseZoomKey({ key: "-", metaKey: true, ctrlKey: false })).toBe("out");
    expect(parseZoomKey({ key: "0", metaKey: true, ctrlKey: false })).toBe("reset");
    expect(parseZoomKey({ key: "-", ctrlKey: false, metaKey: false })).toBeNull();
  });
});

describe("formatPreviewScale", () => {
  it("renders a percent", () => {
    expect(formatPreviewScale(0.82)).toBe("82%");
  });
});
