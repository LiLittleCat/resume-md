import { describe, expect, it } from "vitest";
import { getUiCopy, uiCopy } from "@/locales/ui";

describe("ui copy", () => {
  it("keeps Chinese and English chrome strings in sync", () => {
    expect(Object.keys(uiCopy["zh-CN"]).sort()).toEqual(Object.keys(uiCopy["en-US"]).sort());
  });

  it("falls back to Chinese copy", () => {
    expect(getUiCopy(undefined).exportPdf).toBe("导出 PDF");
    expect(getUiCopy("en-US").exportPdf).toBe("Export PDF");
  });
});
