import { createElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EducationBody } from "@/components/resume/education-section";
import { ExperienceBody } from "@/components/resume/experience-section";
import { GenericBody } from "@/components/resume/generic-section";
import { ProjectsBody } from "@/components/resume/project-section";
import { ResumeDocument } from "@/components/resume/resume-document";
import { SkillsBody } from "@/components/resume/skills-section";
import { SummaryBody } from "@/components/resume/summary-section";
import { compileResume } from "@/core/compile";
import { resolveStyle } from "@/core/style";
import { resolveLocale } from "@/core/locale";

describe("resume components", () => {
  it("exposes the resolved theme to document CSS", () => {
    const locale = resolveLocale("zh-CN");
    const html = renderToStaticMarkup(
      createElement(ResumeDocument, {
        resume: { locale: "zh-CN", profile: { name: "纸上", contact: {} }, sections: [] },
        style: resolveStyle({ themeId: "kami", localeId: "zh-CN" }),
        locale,
      }),
    );

    expect(html).toContain('data-theme="kami"');
    for (const href of ["/fonts/tsanger/400.css", "/fonts/tsanger/500.css"]) {
      expect(html).toContain(`href="${href}"`);
    }
  });

  it("does not load TsangerJinKai until that CJK font is selected", () => {
    const html = renderToStaticMarkup(
      createElement(ResumeDocument, {
        resume: { locale: "zh-CN", profile: { name: "纸上", contact: {} }, sections: [] },
        style: resolveStyle({ themeId: "minimal", localeId: "zh-CN" }),
        locale: resolveLocale("zh-CN"),
      }),
    );

    expect(html).not.toContain("/fonts/tsanger/");
  });

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
    expect(html).toContain('class="resume-item-subtitle resume-experience-field"');
    expect(html).toContain("grid-template-columns:repeat(2, minmax(0, 1fr)) max-content");
    expect(html).toContain("2022.10 - 至今 · 杭州");
    expect(html).not.toContain('class="resume-spread"');
  });

  it("shares remaining experience header space across company, industry, and role", () => {
    const html = renderToStaticMarkup(
      createElement(ExperienceBody, {
        items: [
          {
            company: "天翼交通科技有限公司",
            position: "高级研发工程师",
            metaFields: ["智慧交通", "高级研发工程师"],
            startDate: { raw: "2022.10", year: 2022, month: 10 },
            endDate: { raw: "2026.07", year: 2026, month: 7 },
          },
        ],
        layout: "default",
        locale: resolveLocale("zh-CN"),
      }),
    );

    expect(html).toContain("grid-template-columns:repeat(3, minmax(0, 1fr)) max-content");
    expect(html).toMatch(/天翼交通科技有限公司[\s\S]*智慧交通[\s\S]*高级研发工程师[\s\S]*2022\.10 - 2026\.07/);
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

  it("renders bold markup inside project paragraphs and bullets", () => {
    const html = renderToStaticMarkup(
      createElement(ProjectsBody, {
        items: [
          {
            name: "事件中心",
            blocks: [
              {
                heading: "项目描述",
                type: "paragraph",
                items: ["系统日均处理约 6.5 亿感知目标。"],
                spans: [
                  [
                    { text: "系统日均处理约 " },
                    { text: "6.5 亿感知目标", strong: true },
                    { text: "。" },
                  ],
                ],
              },
              {
                heading: "核心职责与成果",
                type: "unordered-list",
                items: ["支撑每秒 10 万+ 次规则计算。"],
                spans: [
                  [
                    { text: "支撑每秒 " },
                    { text: "10 万+", strong: true },
                    { text: " 次规则计算。" },
                  ],
                ],
              },
            ],
          },
        ],
        locale: resolveLocale("zh-CN"),
      }),
    );

    expect(html).toContain("<strong>6.5 亿感知目标</strong>");
    expect(html).toContain("<strong>10 万+</strong>");
    expect(html).toContain('<h3 class="resume-item-title">事件中心</h3>');
    expect(html).toContain('<h4 class="resume-subhead"');
  });

  it("renders skill list item paragraphs on separate lines", () => {
    const html = renderToStaticMarkup(
      createElement(SkillsBody, {
        section: {
          id: "skills",
          title: "专业技能",
          groups: [
            {
              name: "",
              items: ["Java 与并发 具备扎实的 Java 基础。"],
              richItems: [
                [
                  { text: "Java 与并发", strong: true },
                  { text: " 具备扎实的 Java 基础。" },
                ],
              ],
              richItemParagraphs: [
                [[{ text: "Java 与并发", strong: true }], [{ text: "具备扎实的 Java 基础。" }]],
              ],
              listType: "ordered",
              listStart: 1,
            },
          ],
        },
        layout: "inline",
      }),
    );

    expect(html.match(/resume-skill-paragraph/g)).toHaveLength(2);
    expect(html).toContain("<strong>Java 与并发</strong>");
    expect(html).toMatch(/class="[^"]*resume-bullets[^"]*resume-numbered-list[^"]*resume-skill-list/);
    expect(html).toContain('class="resume-bullet"');
  });

  it("renders summary Markdown lists instead of extra paragraphs", () => {
    const html = renderToStaticMarkup(
      createElement(SummaryBody, {
        section: {
          id: "summary",
          title: "个人简介",
          content: [
            {
              type: "paragraph",
              items: ["7 年后端研发经验。"],
              spans: [[{ text: "7 年后端研发经验。" }]],
            },
            {
              type: "unordered-list",
              items: ["独立完成核心模块设计", "具备 AI Agent 落地经验"],
              spans: [
                [{ text: "独立完成核心模块设计" }],
                [{ text: "具备 " }, { text: "AI Agent", strong: true }, { text: " 落地经验" }],
              ],
            },
          ],
        },
      }),
    );

    expect(html).toContain('class="resume-bullets"');
    expect(html).toContain("<strong>AI Agent</strong>");
    expect(html).not.toMatch(/<p class="resume-paragraph">独立完成核心模块设计<\/p>/);
  });

  it("renders a line break inside a list item", () => {
    const html = renderToStaticMarkup(
      createElement(SummaryBody, {
        section: {
          id: "summary",
          title: "个人简介",
          content: [
            {
              type: "unordered-list",
              items: ["Resume MD Markdown 简历编辑工具。"],
              spans: [
                [
                  {
                    text: "Resume MD",
                    strong: true,
                    href: "https://github.com/LiLittleCat/resume-md",
                  },
                  { text: "\n", break: true },
                  { text: "Markdown 简历编辑工具。" },
                ],
              ],
            },
          ],
        },
      }),
    );

    expect(html).toContain("<br/>");
    expect(html).toContain(
      '<a class="resume-inline-link" href="https://github.com/LiLittleCat/resume-md"><strong>Resume MD</strong></a>',
    );
  });

  it("renders Markdown links as clickable anchors", () => {
    const html = renderToStaticMarkup(
      createElement(SummaryBody, {
        section: {
          id: "summary",
          title: "个人简介",
          content: [
            {
              type: "paragraph",
              items: ["查看个人网站。"],
              spans: [
                [
                  { text: "查看" },
                  { text: "个人网站", href: "https://example.com", strong: true },
                  { text: "。" },
                ],
              ],
            },
          ],
        },
      }),
    );

    expect(html).toContain(
      '<a class="resume-inline-link" href="https://example.com"><strong>个人网站</strong></a>',
    );
  });

  it("renders experience links in paragraphs and bullets", () => {
    const html = renderToStaticMarkup(
      createElement(ExperienceBody, {
        items: [
          {
            company: "示例公司",
            description: "负责业务平台。",
            descriptionSpans: [
              { text: "负责 " },
              { text: "业务平台", href: "https://example.com/platform" },
              { text: "。" },
            ],
            responsibilities: ["编写技术文档"],
            richResponsibilities: [
              [
                { text: "编写 " },
                { text: "技术文档", href: "https://docs.example.com" },
              ],
            ],
          },
        ],
        layout: "default",
        locale: resolveLocale("zh-CN"),
      }),
    );

    expect(html).toContain('href="https://example.com/platform"');
    expect(html).toContain('href="https://docs.example.com"');
  });

  it("keeps authored experience subheadings when the locale changes", () => {
    const html = renderToStaticMarkup(
      createElement(ExperienceBody, {
        items: [
          {
            company: "示例公司",
            blocks: [
              { heading: "主要职责", type: "unordered-list", items: ["负责核心系统"] },
              { heading: "主要成果", type: "unordered-list", items: ["完成稳定性改造"] },
            ],
          },
        ],
        layout: "default",
        locale: resolveLocale("en-US"),
      }),
    );

    expect(html).toContain(">主要职责</h4>");
    expect(html).toContain(">主要成果</h4>");
    expect(html).not.toContain("Responsibilities");
    expect(html).not.toContain("Achievements");
  });

  it("does not invent translated subheadings when source headings are unavailable", () => {
    const locale = resolveLocale("en-US");
    const experienceHtml = renderToStaticMarkup(
      createElement(ExperienceBody, {
        items: [{ company: "示例公司", responsibilities: ["负责核心系统"] }],
        layout: "default",
        locale,
      }),
    );
    const projectHtml = renderToStaticMarkup(
      createElement(ProjectsBody, {
        items: [{ name: "示例项目", responsibilities: ["负责核心模块"] }],
        locale,
      }),
    );

    expect(experienceHtml).not.toContain("Responsibilities");
    expect(projectHtml).not.toContain("Responsibilities");
  });

  it("keeps Chinese Markdown subheadings when document locale switches to English", () => {
    const source = `# 工作经历

## 示例公司

**工程师** | 2024 - 至今

### 主要职责

- 负责核心系统

### 主要成果

- 完成稳定性改造
`;
    const compiled = compileResume({ source, config: { locale: "en-US" } });
    const html = renderToStaticMarkup(
      createElement(ResumeDocument, {
        resume: compiled.resume,
        style: compiled.style,
        locale: compiled.locale,
      }),
    );

    expect(html).toContain('lang="en-US"');
    expect(html).toContain(">主要职责</h4>");
    expect(html).toContain(">主要成果</h4>");
    expect(html).not.toContain(">Responsibilities</h4>");
    expect(html).not.toContain(">Achievements</h4>");
  });

  it("keeps unique keys when two projects share a name and start date", () => {
    const tree = ProjectsBody({
      items: [
        {
          name: "基于多模态大模型的道路抛洒物溯源 Agent",
          startDate: { raw: "2026.06", year: 2026, month: 6 },
        },
        {
          name: "基于多模态大模型的道路抛洒物溯源 Agent",
          startDate: { raw: "2026.06", year: 2026, month: 6 },
        },
      ],
      locale: resolveLocale("zh-CN"),
    });

    const keys = siblingKeys(tree);
    expect(keys).toHaveLength(2);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("keeps unique keys when experience, education, skills, and generic items collide on labels", () => {
    const locale = resolveLocale("zh-CN");
    const experienceKeys = siblingKeys(
      ExperienceBody({
        items: [
          { company: "临江数据", startDate: { raw: "2022.10", year: 2022, month: 10 } },
          { company: "临江数据", startDate: { raw: "2022.10", year: 2022, month: 10 } },
        ],
        layout: "default",
        locale,
      }),
    );
    const educationKeys = siblingKeys(
      EducationBody({
        items: [
          { school: "临江大学", startDate: { raw: "2018.09", year: 2018, month: 9 } },
          { school: "临江大学", startDate: { raw: "2018.09", year: 2018, month: 9 } },
        ],
        locale,
      }),
    );
    const skillKeys = siblingKeys(
      SkillsBody({
        section: {
          id: "skills",
          title: "技能",
          groups: [
            { name: "后端", items: ["Java"] },
            { name: "后端", items: ["Go"] },
          ],
        },
        layout: "inline",
      }),
    );
    const genericTree = GenericBody({
      section: {
        id: "awards",
        title: "奖项",
        items: [{ title: "优秀员工" }, { title: "优秀员工" }],
      },
      locale,
    });
    if (!isValidElement(genericTree)) {
      throw new Error("expected GenericBody to render items");
    }
    const genericKeys = siblingKeys(genericTree);

    for (const keys of [experienceKeys, educationKeys, skillKeys, genericKeys]) {
      expect(keys).toHaveLength(2);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });
});

function siblingKeys(node: ReactElement): Array<string | null> {
  return flattenElements((node.props as { children?: ReactNode }).children)
    .filter((child) => child.type === "article" || child.type === "div")
    .map((child) => child.key);
}

function flattenElements(children: ReactNode): ReactElement[] {
  if (children == null || typeof children === "boolean") return [];
  if (Array.isArray(children)) return children.flatMap(flattenElements);
  return isValidElement(children) ? [children] : [];
}
