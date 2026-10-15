import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { printPageCss } from "@/components/preview/print-resume";
import { resolveStyle } from "@/core/style";

describe("printPageCss", () => {
  it.each([
    ["classic", "#fffdf8"],
    ["kami", "#f5f4ed"],
  ] as const)("paints the full %s PDF page with its theme background", (themeId, color) => {
    const css = printPageCss(resolveStyle({ themeId, localeId: "zh-CN" }));

    expect(css).toMatch(new RegExp(`@page \\{[\\s\\S]*background: ${color}`));
    expect(css).toContain(`background: ${color} !important`);
  });

  it("forces theme backgrounds without the browser's background-graphics option", () => {
    const css = printPageCss(resolveStyle({ themeId: "kami", localeId: "zh-CN" }));
    expect(css).toMatch(/print-color-adjust:\s*exact/);
  });

  it("prints in the browser only after avatars are baked and fonts are loaded", () => {
    const printSource = readFileSync(new URL("../components/preview/print-resume.tsx", import.meta.url), "utf8");
    const exportSource = readFileSync(new URL("../lib/print-export.ts", import.meta.url), "utf8");
    const toolbarSource = readFileSync(new URL("../components/editor/editor-toolbar.tsx", import.meta.url), "utf8");

    expect(printSource).toContain("bakeResumeAvatars");
    expect(exportSource).toContain("data-print-ready");
    expect(exportSource).toContain("fonts.load");
    expect(toolbarSource).toContain("documentFontFamilies");
    expect(toolbarSource).not.toContain("/api/pdf");
  });
});
