import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ExperienceBody } from "@/components/resume/experience-section";
import { ProjectsBody } from "@/components/resume/project-section";
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

  it("lets project items split between their internal content blocks", () => {
    const html = renderToStaticMarkup(
      createElement(ProjectsBody, {
        items: [
          {
            name: "订单中台",
            role: "核心开发",
            blocks: [
              { heading: "项目描述", type: "paragraph", items: ["项目正文"] },
              { heading: "项目成果", type: "unordered-list", items: ["成果一", "成果二"] },
            ],
          },
        ],
        locale: resolveLocale("zh-CN"),
      }),
    );

    expect(html).toContain('class="resume-item resume-project-item"');
    expect(html).not.toMatch(/resume-project-item[^>]*data-keep-together/);
    expect(html).toContain('data-box="project-header"');
    expect(html).toContain('data-box="project-block"');
    expect(html).toContain('data-box="project-bullet"');
  });
});
