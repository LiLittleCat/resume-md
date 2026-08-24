import { describe, expect, it } from "vitest";
import { resolveStyle } from "@/core/style";
import { minimalTheme } from "@/themes/minimal";

describe("resolveStyle", () => {
  it("starts from the theme defaults", () => {
    const style = resolveStyle({ themeId: "minimal", localeId: "en-US" });
    expect(style.themeId).toBe("minimal");
    expect(style.typography.name.fontSize).toBe(minimalTheme.typography.name.fontSize);
    expect(style.spacing.sectionGap).toBe(minimalTheme.spacingPresets.normal.sectionGap);
    expect(style.layout.experience).toBe("default");
    expect(style.icons.mode).toBe("section");
  });

  it("applies locale typography presets after the theme", () => {
    const zh = resolveStyle({ themeId: "minimal", localeId: "zh-CN" });
    const en = resolveStyle({ themeId: "minimal", localeId: "en-US" });
    expect(zh.typography.name.letterSpacing).toBe(0.06);
    expect(en.typography.name.letterSpacing).toBe(-0.022);
  });

  it("applies document config over locale presets", () => {
    const style = resolveStyle({
      themeId: "minimal",
      localeId: "zh-CN",
      config: {
        typography: {
          name: { fontSize: 18 },
          base: { fontSize: 10 },
        },
        spacing: { sectionGap: 8 },
        layout: { skills: "stacked" },
      },
    });
    expect(style.typography.name.fontSize).toBe(18);
    expect(style.typography.body.fontSize).toBe(10);
    expect(style.typography.sectionTitle.fontSize).toBe(minimalTheme.typography.sectionTitle.fontSize);
    expect(style.spacing.sectionGap).toBe(8);
    expect(style.layout.skills).toBe("stacked");
  });

  it("applies spacing presets before custom spacing overrides", () => {
    const compact = resolveStyle({
      themeId: "minimal",
      config: { spacingPreset: "compact" },
    });
    const compactThenCustom = resolveStyle({
      themeId: "minimal",
      config: { spacingPreset: "compact", spacing: { itemGap: 9 } },
    });
    expect(compact.spacing.sectionGap).toBe(minimalTheme.spacingPresets.compact.sectionGap);
    expect(compactThenCustom.spacing.itemGap).toBe(9);
    expect(compactThenCustom.spacing.sectionGap).toBe(minimalTheme.spacingPresets.compact.sectionGap);
  });

  it("applies section overrides without changing other sections", () => {
    const style = resolveStyle({
      themeId: "minimal",
      localeId: "en-US",
      config: {
        sections: {
          projects: {
            typography: { body: { fontSize: 9.5 } },
            layout: "compact",
            icon: "rocket",
          },
        },
      },
    });
    expect(style.sections.projects.typography.body.fontSize).toBe(9.5);
    expect(style.sections.projects.layout).toBe("compact");
    expect(style.sections.projects.icon).toBe("rocket");
    expect(style.sections.experience.typography.body.fontSize).toBe(style.typography.body.fontSize);
    expect(style.sections.experience.layout).toBe("default");
  });

  it("applies runtime overrides last", () => {
    const style = resolveStyle({
      themeId: "minimal",
      config: { typography: { body: { fontSize: 10 } } },
      runtime: { typography: { body: { fontSize: 9 } } },
    });
    expect(style.typography.body.fontSize).toBe(9);
  });

  it("does not treat missing override keys as wipes", () => {
    const style = resolveStyle({
      themeId: "minimal",
      config: { typography: { body: {} }, spacing: {} },
    });
    expect(style.typography.body.fontSize).toBe(minimalTheme.typography.body.fontSize);
    expect(style.spacing.itemGap).toBe(minimalTheme.spacing.itemGap);
  });

  it("falls back to minimal for unknown themes", () => {
    const style = resolveStyle({ themeId: "does-not-exist" });
    expect(style.themeId).toBe("minimal");
  });

  it("resolves icon visibility from mode", () => {
    const none = resolveStyle({ config: { icons: { mode: "none" } } });
    const full = resolveStyle({ config: { icons: { mode: "full" } } });
    expect(none.sections.experience.showSectionIcon).toBe(false);
    expect(none.icons.showContactIcons).toBe(false);
    expect(full.sections.experience.showSectionIcon).toBe(true);
    expect(full.icons.showContactIcons).toBe(true);
  });
});
