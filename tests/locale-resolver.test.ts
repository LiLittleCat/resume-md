import { describe, expect, it } from "vitest";
import { formatDate, formatDateRange } from "@/core/parser";
import { resolveLocale } from "@/core/locale";

describe("resolveLocale", () => {
  it("returns zh-CN labels and present text", () => {
    const locale = resolveLocale("zh-CN");
    expect(locale.id).toBe("zh-CN");
    expect(locale.labels.experience).toBe("工作经历");
    expect(locale.labels.present).toBe("至今");
  });

  it("returns en-US labels and present text", () => {
    const locale = resolveLocale("en-US");
    expect(locale.labels.experience).toBe("Experience");
    expect(locale.labels.present).toBe("Present");
  });

  it("falls back to zh-CN for unknown ids", () => {
    expect(resolveLocale("fr-FR").id).toBe("zh-CN");
    expect(resolveLocale(undefined).id).toBe("zh-CN");
  });
});

describe("date formatting", () => {
  it("formats Chinese ranges with 至今", () => {
    const locale = resolveLocale("zh-CN");
    expect(
      formatDateRange(
        { raw: "2022.10", year: 2022, month: 10 },
        { raw: "至今", present: true },
        locale.id,
        locale.labels.present,
      ),
    ).toBe("2022.10 - 至今");
  });

  it("formats English ranges with Present", () => {
    const locale = resolveLocale("en-US");
    expect(
      formatDate(
        { raw: "Oct 2022", year: 2022, month: 10 },
        locale.id,
        locale.labels.present,
      ),
    ).toBe("Oct 2022");
    expect(
      formatDateRange(
        { raw: "Oct 2022", year: 2022, month: 10 },
        { raw: "Present", present: true },
        locale.id,
        locale.labels.present,
      ),
    ).toBe("Oct 2022 - Present");
  });
});
