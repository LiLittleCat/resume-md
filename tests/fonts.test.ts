import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  TSANGER_JINKAI_FAMILY,
  TSANGER_JINKAI_STYLESHEETS,
  documentFontFamilies,
  usesTsangerJinKai,
} from "@/core/renderer";

describe("resume font loading", () => {
  it("loads only the document's own families while exporting PDF", () => {
    expect(
      documentFontFamilies({
        latin: "Inter",
        cjk: "Noto Sans SC",
        monospace: "JetBrains Mono",
      }),
    ).toEqual(["Inter", "Noto Sans SC", "JetBrains Mono"]);
  });

  it("keeps TsangerJinKai on a same-origin unicode-range stylesheet", () => {
    expect(TSANGER_JINKAI_FAMILY).toBe("TsangerJinKai02");
    expect(TSANGER_JINKAI_STYLESHEETS).toEqual(["/fonts/tsanger/400.css", "/fonts/tsanger/500.css"]);
    expect(
      usesTsangerJinKai({
        latin: "Charter",
        cjk: "TsangerJinKai02",
        monospace: "JetBrains Mono",
      }),
    ).toBe(true);
    expect(
      usesTsangerJinKai({
        latin: "Inter",
        cjk: "Noto Sans SC",
        monospace: "JetBrains Mono",
      }),
    ).toBe(false);
  });

  it("serves unicode-range woff2 instead of a full TTF", () => {
    for (const href of TSANGER_JINKAI_STYLESHEETS) {
      const css = readFileSync(new URL(`../public${href}`, import.meta.url), "utf8");
      expect(css).toMatch(/font-family:\s*["']?TsangerJinKai02/);
      expect(css).toMatch(/format\("woff2"\)/);
      expect(css).toMatch(/unicode-range:/);
      expect(css).not.toMatch(/\.ttf/);
    }
  });
});
