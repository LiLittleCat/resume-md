import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseResumeMarkdown, resolveSectionId } from "@/core/parser";

const examplesDir = path.join(process.cwd(), "examples");

function loadExample(name: string): string {
  return readFileSync(path.join(examplesDir, name), "utf8");
}

describe("section id mapping", () => {
  it("maps localized titles to stable ids", () => {
    expect(resolveSectionId("工作经历")).toBe("experience");
    expect(resolveSectionId("Experience")).toBe("experience");
    expect(resolveSectionId("Work Experience")).toBe("experience");
    expect(resolveSectionId("项目经历")).toBe("projects");
    expect(resolveSectionId("教育经历")).toBe("education");
    expect(resolveSectionId("技术能力")).toBe("skills");
    expect(resolveSectionId("个人简介")).toBe("summary");
  });

  it("does not infer section identity from unknown copy", () => {
    expect(resolveSectionId("随便写的标题")).toBeUndefined();
  });
});

describe("parseResumeMarkdown", () => {
  it("parses the Chinese example into a typed AST", () => {
    const { resume, warnings, frontMatter } = parseResumeMarkdown(loadExample("resume.zh-CN.md"));

    expect(warnings).toEqual([]);
    expect(frontMatter.name).toBe("张三");
    expect(resume.profile.avatar).toBe("/examples/zhangsan.jpg");
    expect(resume.locale).toBe("zh-CN");
    expect(resume.profile.title).toBe("后端开发工程师");
    expect(resume.profile.contact.email).toBe("zhangsan@example.com");
    expect(resume.sections.map((section) => section.id)).toEqual([
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
    ]);

    const summary = resume.sections.find((section) => section.id === "summary");
    expect(summary?.id).toBe("summary");
    if (summary?.id === "summary") {
      expect(summary.content[0]).toContain("5 年后端");
    }

    const skills = resume.sections.find((section) => section.id === "skills");
    expect(skills?.id).toBe("skills");
    if (skills?.id === "skills") {
      expect(skills.groups.map((group) => group.name)).toEqual(["编程语言", "后端", "数据库"]);
      expect(skills.groups[0]?.items).toEqual(["Java", "Python", "TypeScript"]);
    }

    const experience = resume.sections.find((section) => section.id === "experience");
    expect(experience?.id).toBe("experience");
    if (experience?.id === "experience") {
      const item = experience.items[0];
      expect(item?.company).toBe("临江数据科技有限公司");
      expect(item?.position).toBe("后端开发工程师");
      expect(item?.location).toBe("杭州");
      expect(item?.startDate?.year).toBe(2022);
      expect(item?.startDate?.month).toBe(10);
      expect(item?.endDate?.present).toBe(true);
      expect(item?.responsibilities).toHaveLength(2);
      expect(item?.achievements?.[0]).toContain("1,240");
    }

    const projects = resume.sections.find((section) => section.id === "projects");
    expect(projects?.id).toBe("projects");
    if (projects?.id === "projects") {
      const item = projects.items[0];
      expect(item?.name).toBe("订单中台");
      expect(item?.role).toContain("模块负责人");
      expect(item?.techStack).toEqual(["Java", "Spring Boot", "Kafka", "Redis", "MySQL", "LLM"]);
      expect(item?.description).toContain("订单中台");
    }

    const education = resume.sections.find((section) => section.id === "education");
    expect(education?.id).toBe("education");
    if (education?.id === "education") {
      expect(education.items[0]?.school).toBe("临江大学");
      expect(education.items[0]?.major).toBe("计算机科学与技术");
      expect(education.items[0]?.degree).toBe("本科");
      expect(education.items[0]?.startDate?.year).toBe(2018);
      expect(education.items[0]?.endDate?.year).toBe(2022);
    }
  });

  it("parses the English example with English dates", () => {
    const { resume, warnings, frontMatter } = parseResumeMarkdown(loadExample("resume.en-US.md"));
    expect(warnings).toEqual([]);
    expect(frontMatter.locale).toBeUndefined();
    expect(frontMatter.theme).toBeUndefined();
    expect(resume.profile.name).toBe("Helena Park");

    const experience = resume.sections.find((section) => section.id === "experience");
    expect(experience?.id).toBe("experience");
    if (experience?.id === "experience") {
      expect(experience.items[0]?.company).toBe("Meridian Transit Systems");
      expect(experience.items[0]?.startDate?.month).toBe(10);
      expect(experience.items[0]?.startDate?.year).toBe(2022);
      expect(experience.items[0]?.endDate?.present).toBe(true);
    }

    const education = resume.sections.find((section) => section.id === "education");
    expect(education?.id).toBe("education");
    if (education?.id === "education") {
      expect(education.items[0]?.school).toBe("University of Washington");
      expect(education.items[0]?.degree).toBe("B.S. Computer Science");
    }
  });

  it("reads the avatar url from front matter", () => {
    const source = `---
name: Test
avatar: https://cdn.example.com/photo.jpg
---

# 个人简介

hello
`;
    const { resume, warnings } = parseResumeMarkdown(source);
    expect(warnings).toEqual([]);
    expect(resume.profile.avatar).toBe("https://cdn.example.com/photo.jpg");
  });

  it("keeps custom headings as generic sections", () => {
    const source = `---
name: Test
---

# 不是一个标准模块

hello
`;
    const { resume, warnings } = parseResumeMarkdown(source);
    expect(warnings.some((warning) => warning.code === "unknown-section")).toBe(false);
    expect(resume.sections[0]?.id).toBe("custom");
    expect(resume.sections[0]?.title).toBe("不是一个标准模块");
  });

  it("renders extra headings even when the title looks like a known section", () => {
    const source = `---
name: Test
---

# 项目经历

## 已有项目

内容

# 志愿经历

社区服务
`;
    const { resume } = parseResumeMarkdown(source);
    expect(resume.sections.map((section) => section.title)).toEqual(["项目经历", "志愿经历"]);
    expect(resume.sections[1]?.id).toBe("custom");
  });

  it("parses markdown that has no front matter", () => {
    const { resume } = parseResumeMarkdown(`# Summary\n\nIndependent consultant.\n`);
    expect(resume.profile.name).toBe("");
    expect(resume.sections[0]?.id).toBe("summary");
  });
});
