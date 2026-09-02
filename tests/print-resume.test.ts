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
});
