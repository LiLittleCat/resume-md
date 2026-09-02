import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ExperienceBody } from "@/components/resume/experience-section";
import { resolveLocale } from "@/core/locale";

describe("resume components", () => {
  it("places the position between the company and grouped metadata", () => {
    const html = renderToStaticMarkup(
      createElement(ExperienceBody, {
        items: [
          {
            company: "临江数据科技有限公司",
            position: "后端开发工程师",
            location: "杭州",
            startDate: { raw: "2022.10", year: 2022, month: 10 },
            endDate: { raw: "至今", present: true },
          },
        ],
        layout: "default",
        locale: resolveLocale("zh-CN"),
      }),
    );

    expect(html).toContain('class="resume-experience-heading"');
    expect(html).toContain('class="resume-item-subtitle resume-experience-position"');
    expect(html).toContain("2022.10 - 至今 · 杭州");
    expect(html).not.toContain('class="resume-spread"');
  });
});
