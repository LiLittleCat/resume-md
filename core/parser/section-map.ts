import { type SectionId } from "../schema";

export function normalizeLabel(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s\u3000]+/g, "")
    .replace(/[：:：|#]/g, "")
    .replace(/[（(].*?[）)]/g, "");
}

const SECTION_ALIASES: Record<SectionId, readonly string[]> = {
  summary: [
    "个人简介",
    "简介",
    "自我评价",
    "个人概述",
    "概述",
    "summary",
    "profile",
    "about",
    "aboutme",
    "professional summary",
  ],
  skills: [
    "技术能力",
    "专业技能",
    "技能",
    "技能清单",
    "skills",
    "technical skills",
    "technicalskills",
    "expertise",
  ],
  experience: [
    "工作经历",
    "工作经验",
    "职业经历",
    "experience",
    "work experience",
    "workexperience",
    "employment",
  ],
  projects: [
    "项目经历",
    "项目经验",
    "项目",
    "projects",
    "selected projects",
    "project experience",
  ],
  education: ["教育经历", "教育背景", "教育", "学历", "education"],
  openSource: ["开源", "开源项目", "opensource", "open source", "oss"],
  awards: ["奖项", "荣誉", "获奖", "awards", "honors"],
  certifications: ["证书", "认证", "资格证书", "certifications", "certificates"],
  publications: ["论文", "发表", "出版物", "publications"],
  languages: ["语言", "语言能力", "languages"],
  interests: ["兴趣", "爱好", "兴趣爱好", "interests"],
  custom: ["其他", "other", "additional"],
};

const SUBHEADING_ALIASES = {
  responsibilities: ["主要职责", "职责", "工作职责", "responsibilities", "duties", "what i did", "主要工作", "工作内容"],
  achievements: ["主要成果", "成果", "业绩", "亮点", "achievements", "highlights", "impact", "项目成果"],
  description: ["项目简介", "简介", "描述", "description", "overview", "about"],
  techStack: ["技术栈", "技术", "tech stack", "techstack", "stack", "technologies"],
} as const;

export type SubheadingField = keyof typeof SUBHEADING_ALIASES;

const sectionLookup = buildLookup(SECTION_ALIASES);
const subheadingLookup = buildLookup(SUBHEADING_ALIASES);

export function resolveSectionId(title: string): SectionId | undefined {
  return sectionLookup.get(normalizeLabel(title));
}

export function resolveSubheadingField(title: string): SubheadingField | undefined {
  return subheadingLookup.get(normalizeLabel(title));
}

function buildLookup<T extends string>(
  aliases: Record<T, readonly string[]>,
): Map<string, T> {
  const map = new Map<string, T>();
  for (const [id, names] of Object.entries(aliases) as [T, readonly string[]][]) {
    map.set(normalizeLabel(id), id);
    for (const name of names) {
      map.set(normalizeLabel(name), id);
    }
  }
  return map;
}
