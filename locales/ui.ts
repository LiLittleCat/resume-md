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
  back: string;
  resumes: string;
  newResume: string;
  newFromZh: string;
  newFromEn: string;
  duplicateResume: string;
  deleteResume: string;
  deleteResumeTitle: string;
  deleteResumeConfirm: string;
  cancel: string;
  unnamedResume: string;
  editingNow: string;
  resumesEmpty: string;
  resumesEmptyHint: string;
  storageFull: string;
  help: string;
  helpTitle: string;
  helpIntro: string;
  helpSteps: Array<{ title: string; description: string }>;
  helpStorage: string;
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
    back: "返回",
    resumes: "所有简历",
    newResume: "新建简历",
    newFromZh: "中文示例",
    newFromEn: "英文示例",
    duplicateResume: "复制",
    deleteResume: "删除",
    deleteResumeTitle: "删除这份简历？",
    deleteResumeConfirm: "删除后无法恢复。",
    cancel: "取消",
    unnamedResume: "未命名简历",
    editingNow: "编辑中",
    resumesEmpty: "还没有简历",
    resumesEmptyHint: "从一份示例开始，再回到这里管理所有版本。",
    storageFull: "浏览器存储已满，这次修改没有写入本地。",
    help: "帮助",
    helpTitle: "使用 Resume MD",
    helpIntro: "从编辑内容到导出 PDF，一份简历的基本流程。",
    helpSteps: [
      {
        title: "管理简历",
        description: "点击左上角 Resume MD 返回简历列表，可以新建、复制或删除简历。",
      },
      {
        title: "编辑内容",
        description: "在左侧编辑 Markdown。Front matter 是个人信息，一级标题是简历章节。",
      },
      {
        title: "查看预览",
        description: "中间会实时显示分页效果。点击预览中的章节，可以单独调整该章节。",
      },
      {
        title: "调整设计",
        description: "在右侧设置主题、字体、间距、头像、图标和页边距。",
      },
      {
        title: "导出 PDF",
        description: "完成后点击右上角的“导出 PDF”。",
      },
    ],
    helpStorage: "修改会自动保存在当前浏览器中。清除站点数据或更换浏览器后不会自动恢复。",
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
    back: "Back",
    resumes: "All resumes",
    newResume: "New resume",
    newFromZh: "Chinese example",
    newFromEn: "English example",
    duplicateResume: "Duplicate",
    deleteResume: "Delete",
    deleteResumeTitle: "Delete this resume?",
    deleteResumeConfirm: "This cannot be undone.",
    cancel: "Cancel",
    unnamedResume: "Untitled resume",
    editingNow: "Editing",
    resumesEmpty: "No resumes yet",
    resumesEmptyHint: "Start from an example, then come back here to manage every version.",
    storageFull: "Browser storage is full. This change was not saved locally.",
    help: "Help",
    helpTitle: "Using Resume MD",
    helpIntro: "The basic workflow from editing content to exporting a PDF.",
    helpSteps: [
      {
        title: "Manage resumes",
        description: "Click Resume MD in the top left to create, duplicate, or delete resumes.",
      },
      {
        title: "Edit content",
        description: "Write Markdown on the left. Front matter contains profile details; H1 headings define sections.",
      },
      {
        title: "Check the preview",
        description: "The middle panel updates as you type. Click a section in the preview to style it separately.",
      },
      {
        title: "Adjust the design",
        description: "Use the right panel to change the theme, fonts, spacing, photo, icons, and page margins.",
      },
      {
        title: "Export a PDF",
        description: "When you are done, click Export PDF in the top right.",
      },
    ],
    helpStorage: "Changes are saved in this browser. Clearing site data or switching browsers will not restore them automatically.",
  },
};

export function getUiCopy(localeId: string | undefined | null): UiCopy {
  if (localeId === "en-US") return uiCopy["en-US"];
  return uiCopy["zh-CN"];
}

export function resolveUiLocale(localeId: string | undefined | null): LocaleId {
  return localeId === "en-US" ? "en-US" : "zh-CN";
}
