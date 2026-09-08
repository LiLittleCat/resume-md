---
name: write-resume-md
description: >-
  Resume MD: drafts, rewrites, translates, or converts a person's resume into
  this app's Markdown for the left-hand editor, then tells them how to preview
  and export PDF.
---

# Write Resume MD

**Resume MD** is a Markdown resume editor. Paste content on the left, watch A4 pages in the middle, tune design on the right, export PDF.

Read a filled Resume MD example before writing a full resume:

- Chinese: [examples/resume.zh-CN.md](../../../examples/resume.zh-CN.md)
- English: [examples/resume.en-US.md](../../../examples/resume.en-US.md)

## Deliverable

Hand back **one complete Markdown document** the user can paste into Resume MD's left editor. Then give a short paste checklist. Do not wrap the Markdown in commentary that would get pasted with it.

If the user already has editor content, rewrite that source. Invent no jobs, dates, or metrics.

## Site

| Place | What it does |
|---|---|
| `/` | Resume MD editor. Left Markdown, middle paginated preview, right design. |
| `/resumes` | Library: create, duplicate, delete. Click **Resume MD** or **Back** to get there. |
| 中 / EN | Locale for UI labels and date formatting. Does **not** rewrite the Markdown. |
| Design panel | Theme (`minimal` `modern` `classic` `kami`), fonts, spacing, avatar, icons, margins. Click a preview section to override that section only. |
| 导出 PDF / Export PDF | Prints the current Markdown + design through Chromium. |

Content lives in this browser's `localStorage`. No account. Clearing site data or switching browsers drops it.

Photo: tell the user to upload it in Design. Put `avatar:` in front matter only when they already have a URL. Never point at `/examples/*.jpg`.

Match 中/EN to the Markdown language. Theme, fonts, and spacing stay in the Design panel.

## Markdown dialect

This is Resume MD's dialect, not generic resume Markdown.

Front matter is the header. `#` is a section. `##` is one job, project, school, or skill group. `###` is a labeled block inside an item.

Text before the first `#` is dropped. Horizontal rules and HTML are ignored. Tables and body images are not a layout. Italic, links, and strikethrough flatten to plain text. `**bold**` survives only inside a skills **list**.

### Front matter

```yaml
---
name: 张三
title: 后端开发工程师
contact:
  phone: 138-0000-1111
  email: zhangsan@example.com
  location: 杭州
  github: https://github.com/zhangsan
  linkedin: https://linkedin.com/in/zhangsan
  website: https://zhangsan.dev
---
```

Allowed contact keys: `phone` `email` `location` `github` `linkedin` `website`. Full URLs are fine; the header strips `https://` for display.

Optional: `locale: zh-CN` or `locale: en-US`. The editor toggle usually owns this. Skip `theme` unless asked.

### Section titles

Use a known title so the section gets the right layout. Unknown `#` titles render as a generic block. A second copy of a known title also becomes generic — do not repeat `工作经历` / `Experience`.

| id | Chinese | English |
|---|---|---|
| summary | 个人简介 简介 自我评价 | Summary Profile About |
| skills | 技术能力 专业技能 技能 | Skills Technical Skills |
| experience | 工作经历 工作经验 职业经历 | Experience Work Experience |
| projects | 项目经历 项目经验 项目 | Projects Selected Projects |
| education | 教育经历 教育背景 教育 学历 | Education |
| openSource | 开源 开源项目 | Open Source |
| awards | 奖项 荣誉 获奖 | Awards Honors |
| certifications | 证书 认证 资格证书 | Certifications |
| publications | 论文 发表 出版物 | Publications |
| languages | 语言 语言能力 | Languages |
| interests | 兴趣 爱好 兴趣爱好 | Interests |

Default order: summary → skills → experience → projects → education, then extras the person actually has.

### Meta line

The first pipe / bold line after `##` is position, dates, location:

```md
**后端开发工程师** | 2022.10 - 至今 | 杭州
```

```md
**Senior Backend Engineer** | Oct 2022 - Present | San Francisco
```

Order: subtitle `|` dates `|` location. A date-only paragraph on its own line also works.

Dates: `2022.10`, `2022-10`, `Oct 2022`, `2022`, `至今` / `Present`. Ranges: `-`, `~`, `—`, `至`.

### 个人简介 / Summary

Paragraphs (and lists, which become extra paragraphs). No `##`.

### 技术能力 / Skills

`##` groups. A slash line becomes inline chips:

```md
## 后端

Spring Boot / Kafka / PostgreSQL
```

Splitters: `/` `、` `|` `,` `，`.

A **single** list keeps list layout and bold. Use that for longer skill blurbs:

```md
1. **Java 与并发**：七年后端，熟悉集合与并发。
```

Mixing a slash line and a list in one group flattens both.

### 工作经历 / Experience

```md
# 工作经历

## 临江数据科技有限公司

**后端开发工程师** | 2022.10 - 至今 | 杭州

负责订单与库存服务。

### 主要职责

- 设计订单状态机和失败补偿流程

### 主要成果

- 将订单查询 P95 从 420ms 降到 168ms
```

`##` is the company. The preview always labels the two lists with locale copy (`主要职责` / `Responsibilities`, `主要成果` / `Achievements`), not the H3 text you typed — use the aliases below.

| field | Chinese | English |
|---|---|---|
| responsibilities | 主要职责 职责 工作职责 主要工作 工作内容 | Responsibilities Duties |
| achievements | 主要成果 成果 业绩 亮点 项目成果 | Achievements Highlights Impact |

A list with no `###` goes to responsibilities. Skip empty headings.

### 项目经历 / Projects

`##` is the project name. `###` text is **shown as written**.

```md
## 订单中台

**核心开发 / 模块负责人** | 2025.01 - 2026.06

### 项目简介

面向多业务线的订单中台。

### 技术栈

`Java` `Spring Boot` `Kafka` `Redis` `MySQL`

### 主要工作

- 设计订单状态流转与消息驱动架构
```

A paragraph of **only** inline code becomes tech chips. Known H3 aliases (`项目简介`, `技术栈`, `Overview`, `Tech stack`, …) still map for parsing; unknown H3s still render.

### 教育经历 / Education

```md
## 临江大学

**计算机科学与技术 · 本科**

2018.09 - 2022.06
```

`##` is the school. `专业 · 学历` splits on `·` `•` `/` `|`. English `**B.S. Computer Science**` with no separator stays one subtitle. Lists under the item become details.

### Extra sections

Same shape as experience: `##` title, optional meta line, paragraph, bullets. Keep the heading in the resume language (`开源项目`, not `Open Source`, on a Chinese resume).

## Fit the page

The middle pane is the truth: A4 (or Letter) with real page breaks.

- One language per resume.
- Tight bullets with a number, a system, or a before/after. Drop filler.
- Prefer slash-separated skills unless a skill needs a sentence.
- If preview spills to a second page the user did not ask for, cut before shrinking type in Design.

## After they paste

1. Replace everything in Resume MD's left editor (front matter included).
2. Set 中 or EN to match the Markdown.
3. Upload the photo in Design if they have one.
4. Scan the preview for overflow, missing meta lines, and sections that fell back to generic layout.
5. Export PDF from the top right.
