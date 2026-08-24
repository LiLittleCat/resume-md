import type { LocaleDefinition } from "@/core/schema";

export const zhCN: LocaleDefinition = {
  id: "zh-CN",
  name: "中文",
  labels: {
    summary: "个人简介",
    skills: "技术能力",
    experience: "工作经历",
    projects: "项目经历",
    education: "教育经历",
    openSource: "开源项目",
    awards: "奖项荣誉",
    certifications: "资格认证",
    publications: "论文发表",
    languages: "语言能力",
    interests: "兴趣爱好",
    custom: "其他",
    present: "至今",
    responsibilities: "主要职责",
    achievements: "主要成果",
    techStack: "技术栈",
    description: "简介",
  },
  date: {
    format: "zh-dot",
  },
  typographyPreset: {
    base: { lineHeight: 1.45 },
    body: { lineHeight: 1.45 },
    bullet: { lineHeight: 1.4 },
    name: { letterSpacing: 0.04 },
  },
};
