import type {
  AvatarPosition,
  AvatarShape,
  EducationLayout,
  ExperienceLayout,
  IconMode,
  LocaleId,
  ProjectLayout,
  SkillsLayout,
  SpacingPreset,
  ThemeId,
} from "@/core/schema";

export interface UiCopy {
  content: string;
  loadExample: string;
  design: string;
  document: string;
  noDocument: string;
  markdownAria: string;
  compileError: string;
  scale: string;
  exportPdf: string;
  pdfExported: string;
  pdfFailed: string;
  printEmpty: string;
  theme: string;
  typography: string;
  latin: string;
  cjk: string;
  name: string;
  sectionTitle: string;
  body: string;
  lineHeight: string;
  spacing: string;
  sectionGap: string;
  itemGap: string;
  layout: string;
  icons: string;
  iconSize: string;
  page: string;
  marginY: string;
  marginX: string;
  title: string;
  meta: string;
  icon: string;
  reset: string;
  inheritHint: string;
  inherited: string;
  recommended: string;
  allIcons: string;
  viewAll: string;
  resizeContent: string;
  resizeDesign: string;
  localeZh: string;
  localeEn: string;
  schemeLight: string;
  schemeDark: string;
  schemeSystem: string;
  outline: string;
  themes: Record<ThemeId, string>;
  spacingPresets: Record<SpacingPreset, string>;
  experienceLayouts: Record<ExperienceLayout, string>;
  projectLayouts: Record<ProjectLayout, string>;
  skillsLayouts: Record<SkillsLayout, string>;
  educationLayouts: Record<EducationLayout, string>;
  iconModes: Record<IconMode, string>;
  avatar: string;
  avatarPosition: string;
  avatarShape: string;
  avatarPositions: Record<AvatarPosition, string>;
  avatarShapes: Record<AvatarShape, string>;
  avatarUpload: string;
  avatarChange: string;
  avatarRemove: string;
  avatarInvalid: string;
}

export const uiCopy: Record<LocaleId, UiCopy> = {
  "zh-CN": {
    content: "内容",
    loadExample: "加载示例",
    design: "设计",
    document: "文档",
    noDocument: "没有文档",
    markdownAria: "简历 Markdown",
    compileError: "Markdown 无法编译。",
    scale: "缩放",
    exportPdf: "导出 PDF",
    pdfExported: "已导出 PDF",
    pdfFailed: "无法导出 PDF",
    printEmpty: "没有可打印的简历。",
    theme: "主题",
    typography: "字体",
    latin: "西文",
    cjk: "中文",
    name: "姓名",
    sectionTitle: "章节标题",
    body: "正文",
    lineHeight: "行高",
    spacing: "间距",
    sectionGap: "章节间距",
    itemGap: "条目间距",
    layout: "版式",
    icons: "图标",
    iconSize: "尺寸",
    page: "页面",
    marginY: "上下边距",
    marginX: "左右边距",
    title: "标题",
    meta: "元信息",
    icon: "图标",
    reset: "重置",
    inheritHint: "未修改的值继承文档样式。",
    inherited: "继承",
    recommended: "推荐",
    allIcons: "全部图标",
    viewAll: "查看全部",
    resizeContent: "调整内容栏宽度",
    resizeDesign: "调整设计栏宽度",
    localeZh: "中文",
    localeEn: "English",
    schemeLight: "日间",
    schemeDark: "夜间",
    schemeSystem: "系统",
    outline: "目录",
    themes: {
      minimal: "极简",
      modern: "现代",
      classic: "经典",
    },
    spacingPresets: {
      compact: "紧凑",
      normal: "常规",
      relaxed: "宽松",
    },
    experienceLayouts: {
      default: "默认",
      compact: "紧凑",
      stacked: "堆叠",
    },
    projectLayouts: {
      default: "默认",
      compact: "紧凑",
    },
    skillsLayouts: {
      inline: "行内",
      stacked: "堆叠",
      columns: "分栏",
    },
    educationLayouts: {
      default: "默认",
      compact: "紧凑",
    },
    iconModes: {
      none: "关闭",
      section: "章节",
      full: "全部",
    },
    avatar: "头像",
    avatarPosition: "位置",
    avatarShape: "形状",
    avatarPositions: {
      left: "左侧",
      center: "居中",
      right: "右侧",
    },
    avatarShapes: {
      square: "方形",
      circle: "圆形",
    },
    avatarUpload: "上传",
    avatarChange: "更换",
    avatarRemove: "移除",
    avatarInvalid: "请选择一张图片",
  },
  "en-US": {
    content: "Content",
    loadExample: "Load example",
    design: "Design",
    document: "Document",
    noDocument: "No document",
    markdownAria: "Resume markdown",
    compileError: "Markdown could not be compiled.",
    scale: "Scale",
    exportPdf: "Export PDF",
    pdfExported: "PDF exported",
    pdfFailed: "Could not export PDF",
    printEmpty: "No resume loaded for print.",
    theme: "Theme",
    typography: "Typography",
    latin: "Latin",
    cjk: "CJK",
    name: "Name",
    sectionTitle: "Section title",
    body: "Body",
    lineHeight: "Line height",
    spacing: "Spacing",
    sectionGap: "Section gap",
    itemGap: "Item gap",
    layout: "Layout",
    icons: "Icons",
    iconSize: "Size",
    page: "Page",
    marginY: "Top / bottom",
    marginX: "Left / right",
    title: "Title",
    meta: "Meta",
    icon: "Icon",
    reset: "Reset",
    inheritHint: "Overrides inherit from the document.",
    inherited: "Inherited",
    recommended: "Recommended",
    allIcons: "All icons",
    viewAll: "View all",
    resizeContent: "Resize content panel",
    resizeDesign: "Resize design panel",
    localeZh: "Chinese",
    localeEn: "English",
    schemeLight: "Light",
    schemeDark: "Dark",
    schemeSystem: "System",
    outline: "Outline",
    themes: {
      minimal: "Minimal",
      modern: "Modern",
      classic: "Classic",
    },
    spacingPresets: {
      compact: "Compact",
      normal: "Normal",
      relaxed: "Relaxed",
    },
    experienceLayouts: {
      default: "Default",
      compact: "Compact",
      stacked: "Stacked",
    },
    projectLayouts: {
      default: "Default",
      compact: "Compact",
    },
    skillsLayouts: {
      inline: "Inline",
      stacked: "Stacked",
      columns: "Columns",
    },
    educationLayouts: {
      default: "Default",
      compact: "Compact",
    },
    iconModes: {
      none: "None",
      section: "Section",
      full: "Full",
    },
    avatar: "Photo",
    avatarPosition: "Position",
    avatarShape: "Shape",
    avatarPositions: {
      left: "Left",
      center: "Center",
      right: "Right",
    },
    avatarShapes: {
      square: "Square",
      circle: "Circle",
    },
    avatarUpload: "Upload",
    avatarChange: "Replace",
    avatarRemove: "Remove",
    avatarInvalid: "Please choose an image",
  },
};

export function getUiCopy(localeId: string | undefined | null): UiCopy {
  if (localeId === "en-US") return uiCopy["en-US"];
  return uiCopy["zh-CN"];
}

export function resolveUiLocale(localeId: string | undefined | null): LocaleId {
  return localeId === "en-US" ? "en-US" : "zh-CN";
}
