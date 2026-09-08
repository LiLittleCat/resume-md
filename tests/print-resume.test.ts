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

  it("bakes transparent avatars onto the paper color before PDF capture", () => {
    const printSource = readFileSync(new URL("../components/preview/print-resume.tsx", import.meta.url), "utf8");
    const routeSource = readFileSync(new URL("../app/api/pdf/route.ts", import.meta.url), "utf8");

    expect(printSource).toContain("bakeResumeAvatars");
    expect(routeSource).toContain("data-print-ready");
  });
});
