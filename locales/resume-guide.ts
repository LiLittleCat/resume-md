import type { LocaleId } from "@/core/schema";

interface GuideTopic {
  id: string;
  title: string;
  description: string;
  example?: string;
}

export interface ResumeGuideCopy {
  quickStart: string;
  syntax: string;
  template: string;
  templateIntro: string;
  copyTemplate: string;
  copyPrompt: string;
  copying: string;
  copied: string;
  copyFailed: string;
  agentTitle: string;
  agentIntro: string;
  agentSteps: string[];
  promptLabel: string;
  agentRequest: string;
  agentMaterial: string;
  structure: string;
  topics: GuideTopic[];
}

export const resumeGuideCopy: Record<LocaleId, ResumeGuideCopy> = {
  "zh-CN": {
    quickStart: "快速开始",
    syntax: "Markdown 格式",
    template: "完整模板",
    templateIntro: "复制到左侧编辑器，替换示例资料，删去不需要的章节。示例中的经历和数字仅用于演示格式。",
    copyTemplate: "复制模板",
    copyPrompt: "复制提示词",
    copying: "正在复制…",
    copied: "已复制",
    copyFailed: "复制失败，请选中文字后手动复制。",
    agentTitle: "让 AI 帮你写简历",
    agentIntro: "这段提示词包含 Resume MD 的格式规则。复制给你使用的 AI agent，再补充自己的资料。",
    agentSteps: [
      "复制下方提示词，粘贴到 AI 对话中。",
      "附上现有简历或工作、项目、教育经历，说明目标岗位与简历语言。",
      "把 AI 生成的 Markdown 粘贴到左侧编辑器，检查预览后导出 PDF。",
    ],
    promptLabel: "给 AI agent 的提示词",
    agentRequest: `请根据我提供的真实资料，帮我撰写或改写一份可直接粘贴到 Resume MD 的简历 Markdown。

先确认目标岗位、简历语言，以及缺少的姓名、联系方式、工作、项目和教育经历。资料不足时，集中向我提问，等我补充后再生成。不得编造公司、职位、日期、学历、技能或成果数据；没有的数据就省略。下面的示例只展示格式，不能当作我的经历。

围绕目标岗位组织内容，使用简洁、具体的描述；有真实数据时写明成果。全篇使用一种语言。默认按个人简介、技术能力、工作经历、项目经历、教育经历排序，只保留有资料的章节。

严格遵守下面的 Resume MD 格式规则。最终只输出一份完整 Markdown 原文，从开头的 --- 开始，不加外层代码围栏、前言或解释。主题、字体、间距和头像上传交给网站的设计面板。`,
    agentMaterial: "我的资料（由我补充）：\n- 目标岗位：\n- 简历语言：\n- 现有简历或真实经历：",
    structure: "开头的 --- … --- 记录个人信息；# 是章节，## 是一条经历或技能分组，### 是经历中的内容小标题。标题与正文之间留一个空行。",
    topics: [
      {
        id: "profile",
        title: "个人信息 · 文档开头",
        description: "第一行必须是 ---。两条 --- 之间是 YAML 个人信息（front matter），姓名写在 name，不要另写 # 姓名。contact 下缩进两个空格，可用字段为 phone、email、location、github、linkedin、website；所有值都写成字符串，电话号码建议加引号。可选 locale 为 zh-CN 或 en-US；avatar 仅在已有图片 URL 时填写，也可以在设计面板上传头像。",
        example: `---
name: "张三"
title: "后端开发工程师"
locale: zh-CN
contact:
  phone: "138-0000-1111"
  email: "zhangsan@example.com"
  location: "杭州"
  github: "https://github.com/zhangsan"
  linkedin: "https://linkedin.com/in/zhangsan"
  website: "https://zhangsan.dev"
---`,
      },
      {
        id: "headings",
        title: "章节标题 · #",
        description: "常用标题会自动匹配对应版式：个人简介 / Summary、技术能力 / Skills、工作经历 / Experience、项目经历 / Projects、教育经历 / Education。也支持专业技能、工作经验、教育背景、Technical Skills、Work Experience 等别名。同类章节只写一次，将多条经历放在同一章节下；重复标题或未知标题会变成普通章节。",
      },
      {
        id: "summary",
        title: "个人简介 · 段落",
        description: "在 # 个人简介 下直接写一到两段概述，突出方向、经验和优势。这里不需要二级标题。",
        example: `# 个人简介

后端开发工程师，专注订单系统与服务性能优化。`,
      },
      {
        id: "skills",
        title: "技能 · 标签或列表",
        description: "用 ## 为技能分组。短技能用 /、顿号、竖线或逗号分隔，会显示为标签；长描述用 - 或 1. 列表，技能列表中的 **加粗** 会保留。同一分组选择一种写法，混合标签段落与列表会合并成普通技能项。",
        example: `# 技术能力

## 后端

Java / Spring Boot / PostgreSQL

## 工程能力

1. **性能优化**：熟悉慢查询分析与接口性能排查。
2. **工程实践**：使用自动化测试保障核心流程。`,
      },
      {
        id: "experience",
        title: "工作经历 · 职责与成果",
        description: "## 写公司名称，紧接的独立段落按“行业 | 职位 | 日期范围”排列，每个 | 分隔一个字段。日期固定在最右，日期前的字段与公司均分剩余宽度。旧的“**职位** | 日期范围 | 地点”写法仍然支持，地点可省略。### 主要职责 / Responsibilities 和 ### 主要成果 / Achievements 将列表归到对应区域；无小标题的列表归入职责。预览会保留 Markdown 中写下的小标题原文，切换界面语言不会翻译简历正文。",
        example: `# 工作经历

## 示例科技有限公司

智慧交通 | 高级研发工程师 | 2022.10 - 至今

负责订单与库存服务。

### 主要职责

- 设计订单状态流转与失败补偿流程

### 主要成果

- 将订单查询 P95 从 420ms 降到 168ms`,
      },
      {
        id: "dates",
        title: "日期 · 起止时间",
        description: "支持 2022.10、2022-10、Oct 2022 和 2022，结束时间可用 至今 或 Present。推荐写成 2022.10 - 至今，连接符 - 两边留空格。日期也可以单独成段，与前后内容空一行。",
      },
      {
        id: "projects",
        title: "项目经历 · 描述、技术栈与列表",
        description: "## 写项目名称，其下可写角色与日期。### 小标题按原文显示，支持自定义为项目简介、技术栈、主要工作等。单独一段只写反引号包裹的词，会显示为技术标签；还可以写普通段落、无序列表或有序列表。",
        example: `# 项目经历

## 订单中台

**核心开发** | 2025.01 - 2025.06

### 项目简介

面向多业务线的订单管理服务。

### 技术栈

\`Java\` \`Spring Boot\` \`PostgreSQL\`

### 主要工作

- 设计订单状态机和消息重试流程`,
      },
      {
        id: "education",
        title: "教育经历 · 学校、专业与学历",
        description: "## 写学校，下一段用 **专业 · 学历**，再单独写日期范围。专业与学历也可以用 / 分隔。条目下的列表可补充课程、荣誉等信息。",
        example: `# 教育经历

## 示例大学

**计算机科学与技术 · 本科**

2018.09 - 2022.06

- 主修数据结构、数据库与计算机网络`,
      },
      {
        id: "extras",
        title: "更多章节 · 开源、荣誉与自定义内容",
        description: "支持开源项目 / Open Source、奖项 / Awards、证书 / Certifications、论文 / Publications、语言 / Languages、兴趣 / Interests，也可自定义一级标题。开源章节用 # 或 ## 皆可。列表标题可用 | 或 ｜ 接日期，预览会把时间放到右侧，与项目、工作经历一致。也可用 ## 添加条目，再写可选的加粗副标题或日期、段落与列表。",
        example: `# 开源项目

- **[Resume MD](https://github.com/example/resume-md)** | 2024.06 - 至今
  Markdown 简历编辑工具。`,
      },
      {
        id: "formatting",
        title: "格式边界 · 以预览为准",
        description: "正文支持段落与列表；加粗和 Markdown 链接会保留，链接在导出的 PDF 中也可以点击，斜体与删除线按纯文本处理。项目中整段反引号词组显示为标签。表格、代码块、引用块、HTML、分隔线和正文图片不用于简历排版；请用上述结构表达内容。第一个 # 之前的正文不会显示。主题、字体、间距和头像在设计面板设置。中 / EN 切换界面标签与日期格式，不会翻译正文。",
      },
    ],
  },
  "en-US": {
    quickStart: "Quick start",
    syntax: "Markdown guide",
    template: "Full template",
    templateIntro: "Copy into the left editor, replace the sample details, and remove sections you do not need. All sample experience and metrics are for illustration.",
    copyTemplate: "Copy template",
    copyPrompt: "Copy prompt",
    copying: "Copying…",
    copied: "Copied",
    copyFailed: "Could not copy. Select the text and copy it manually.",
    agentTitle: "Write your resume with AI",
    agentIntro: "This prompt includes the Resume MD format rules. Copy it to your AI agent and add your own details.",
    agentSteps: [
      "Copy the prompt below into your AI conversation.",
      "Add your current resume or work, project, and education history, plus your target role and resume language.",
      "Paste the generated Markdown into the left editor, review the preview, and export a PDF.",
    ],
    promptLabel: "Prompt for your AI agent",
    agentRequest: `Use the real information I provide to write or revise a resume Markdown document that I can paste directly into Resume MD.

First confirm my target role, resume language, and any missing name, contact, work, project, or education details. If information is missing, ask for it in one round and wait for my reply before generating the resume. Never invent employers, roles, dates, degrees, skills, or metrics; omit unavailable information. The examples below demonstrate syntax only and are not my experience.

Organize the content for the target role. Use concise, specific descriptions and include results when real data is available. Use one language throughout. The default order is Summary, Skills, Experience, Projects, Education; include only sections supported by my information.

Follow the Resume MD rules below exactly. Return only one complete raw Markdown document starting with ---, without an outer code fence, preface, or explanation. Leave theme, fonts, spacing, and photo uploads to the website's Design panel.`,
    agentMaterial: "My information (I will fill this in):\n- Target role:\n- Resume language:\n- Current resume or real experience:",
    structure: "The opening --- … --- block holds your profile. # starts a section, ## starts an entry or skill group, and ### labels a block within an entry. Leave a blank line between headings and content.",
    topics: [
      {
        id: "profile",
        title: "Profile · start of document",
        description: "The first line must be ---. Put YAML profile details (front matter) between the two --- lines. Use name for your name instead of a # heading. Indent contact fields by two spaces. Supported fields: phone, email, location, github, linkedin, website. All values must be strings; quote phone numbers. Optional locale: zh-CN or en-US. Only add avatar if you already have an image URL, or upload a photo in Design.",
        example: `---
name: "Alex Chen"
title: "Backend Engineer"
locale: en-US
contact:
  phone: "+1 (415) 555-0100"
  email: "alex@example.com"
  location: "San Francisco"
  github: "https://github.com/alex"
  linkedin: "https://linkedin.com/in/alex"
  website: "https://alex.example.com"
---`,
      },
      {
        id: "headings",
        title: "Sections · # headings",
        description: "Known titles select the appropriate layout: Summary / 个人简介, Skills / 技术能力, Experience / 工作经历, Projects / 项目经历, Education / 教育经历. Aliases such as Technical Skills, Work Experience, 专业技能, 工作经验, and 教育背景 also work. Use each section type once and put multiple entries under it. Repeated or unknown section titles become generic sections.",
      },
      {
        id: "summary",
        title: "Summary · paragraphs",
        description: "Write one or two short paragraphs directly under # Summary, covering your focus, experience, and strengths. Do not add ## headings here.",
        example: `# Summary

Backend engineer focused on order systems and service performance.`,
      },
      {
        id: "skills",
        title: "Skills · tags or lists",
        description: "Group skills with ##. Separate short skills with /, 、, |, or commas to display tags. Use a - or 1. list for longer descriptions; **bold** is preserved in skills lists. Use one format per group. Mixing a tag paragraph and a list flattens them into plain skill items.",
        example: `# Skills

## Backend

Java / Spring Boot / PostgreSQL

## Engineering

1. **Performance**: Analyze slow queries and service bottlenecks.
2. **Quality**: Use automated tests to protect critical workflows.`,
      },
      {
        id: "experience",
        title: "Experience · responsibilities and achievements",
        description: "Use ## for the company, followed by a separate paragraph in the form industry | position | date range, with each | separating one field. The date stays at the far right, while the company and fields before the date share the remaining width equally. The existing **Position** | date range | location form remains supported; location is optional. Use ### Responsibilities / 主要职责 and ### Achievements / 主要成果 to group bullets. Unlabeled lists become responsibilities. The preview preserves the authored Markdown subheading; changing the interface language does not translate resume content.",
        example: `# Experience

## Example Technologies

Smart Transportation | Senior R&D Engineer | Oct 2022 - Present

Owned order and inventory services.

### Responsibilities

- Designed order state transitions and failure recovery

### Achievements

- Reduced order query P95 from 420ms to 168ms`,
      },
      {
        id: "dates",
        title: "Dates · start and end",
        description: "Supported formats include 2022.10, 2022-10, Oct 2022, and 2022. Use Present or 至今 for an ongoing role. Write ranges as Oct 2022 - Present with spaces around the hyphen. Dates can also be a separate paragraph, with a blank line before and after.",
      },
      {
        id: "projects",
        title: "Projects · descriptions, tech stacks, and lists",
        description: "Use ## for the project name, optionally followed by a role and date range. ### labels display exactly as written, so you can use Overview, Tech stack, Responsibilities, or your own labels. A paragraph containing only backtick-wrapped words becomes tech tags. Plain paragraphs, unordered lists, and ordered lists also work.",
        example: `# Projects

## Order Platform

**Core developer** | Jan 2025 - Jun 2025

### Overview

An order management service shared by multiple business units.

### Tech stack

\`Java\` \`Spring Boot\` \`PostgreSQL\`

### Responsibilities

- Designed the order state machine and message retries`,
      },
      {
        id: "education",
        title: "Education · school, major, and degree",
        description: "Use ## for the school, a separate **Major · Degree** paragraph, then a date range on its own. A slash can also separate major and degree. Lists can add coursework or honors.",
        example: `# Education

## Example University

**Computer Science · B.S.**

Sep 2018 - Jun 2022

- Coursework: data structures, databases, and computer networks`,
      },
      {
        id: "extras",
        title: "More sections · open source, awards, and custom content",
        description: "Other recognized sections: Open Source / 开源项目, Awards / 奖项, Certifications / 证书, Publications / 论文, Languages / 语言, Interests / 兴趣. You can also use a custom # heading. Open Source works with # or ##. In those lists, append | or ｜ dates on the title line so the preview puts the range on the right, matching Projects and Experience. You can also add entries with ##, then an optional bold subtitle or date, paragraphs, and bullets.",
        example: `# Open Source

- **[Resume MD](https://github.com/example/resume-md)** | Jun 2024 - Present
  A Markdown resume editor.`,
      },
      {
        id: "formatting",
        title: "Formatting limits · check the preview",
        description: "Body content supports paragraphs and lists. Bold and Markdown links are preserved, and links remain clickable in exported PDFs; italics and strikethrough become plain text. Backtick-only paragraphs in projects become tags. Tables, code blocks, blockquotes, HTML, horizontal rules, and body images are not supported for resume layout. Use the structures above. Text before the first # heading is omitted. Set theme, fonts, spacing, and photo in Design. 中 / EN changes interface labels and date formatting; it does not translate your text.",
      },
    ],
  },
};

export function buildAgentPrompt(guide: ResumeGuideCopy): string {
  return [
    guide.agentRequest,
    guide.structure,
    ...guide.topics.map((topic) => [
      topic.title,
      topic.description,
      topic.example ? `\`\`\`markdown\n${topic.example}\n\`\`\`` : undefined,
    ].filter(Boolean).join("\n\n")),
    guide.agentMaterial,
  ].join("\n\n");
}

export function buildResumeTemplate(guide: ResumeGuideCopy): string {
  return guide.topics
    .filter((topic) => ["profile", "summary", "skills", "experience", "projects", "education"].includes(topic.id))
    .map((topic) => topic.example)
    .join("\n\n");
}
