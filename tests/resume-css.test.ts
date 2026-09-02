import { describe, expect, it } from "vitest";
import { RESUME_DOCUMENT_CSS } from "@/core/renderer";

describe("resume document CSS", () => {
  it("does not apply uppercase to the heading that wraps section icons", () => {
    expect(RESUME_DOCUMENT_CSS).not.toMatch(
      /\.resume-section-title\[data-transform="uppercase"\] \{\s*text-transform:\s*uppercase/,
    );
    expect(RESUME_DOCUMENT_CSS).toMatch(
      /\.resume-section-title\[data-transform="uppercase"\] \.resume-section-title-text \{\s*text-transform:\s*uppercase/,
    );
    expect(RESUME_DOCUMENT_CSS).toMatch(
      /\.resume-root\[lang="zh-CN"\] \.resume-section-title\[data-transform="uppercase"\] \.resume-section-title-text \{\s*text-transform:\s*none/,
    );
  });

  it("applies section title type to the text, not the icon wrapper", () => {
    expect(RESUME_DOCUMENT_CSS).toMatch(
      /\.resume-section-title-text \{[\s\S]*?font-size:\s*var\(--resume-section-title-size\)/,
    );
    expect(RESUME_DOCUMENT_CSS).toMatch(
      /\.resume-section-title-text \{[\s\S]*?letter-spacing:\s*var\(--resume-section-title-tracking\)/,
    );
    expect(RESUME_DOCUMENT_CSS).not.toMatch(
      /\.resume-section-title \{[^}]*font-size:\s*var\(--resume-section-title-size\)/,
    );
    expect(RESUME_DOCUMENT_CSS).toMatch(/\.resume-icon\s*\{[\s\S]*?text-transform:\s*none/);
    expect(RESUME_DOCUMENT_CSS).toMatch(
      /\.resume-icon\[data-filled="true"\] svg \{[\s\S]*?fill:\s*currentColor/,
    );
  });

  it("lays out an avatar beside or above the identity block", () => {
    expect(RESUME_DOCUMENT_CSS).toMatch(/\.resume-header\[data-avatar="right"\]/);
    expect(RESUME_DOCUMENT_CSS).toMatch(
      /\.resume-header\[data-avatar="left"\],\s*\.resume-header\[data-avatar="right"\] \{\s*display:\s*grid;\s*align-items:\s*start/,
    );
    expect(RESUME_DOCUMENT_CSS).not.toMatch(/\.resume-header\[data-avatar\] \{\s*overflow:\s*hidden/);
    expect(RESUME_DOCUMENT_CSS).toMatch(
      /\.resume-root \.resume-avatar\[data-shape="circle"\] \{\s*border-radius:\s*50%/,
    );
  });

  it("sizes inline skill labels to their content without breaking unnamed groups", () => {
    expect(RESUME_DOCUMENT_CSS).toMatch(
      /\.resume-skills\[data-layout="inline"\] \.resume-skill-group \{[\s\S]*?grid-template-columns:\s*fit-content\(35%\) minmax\(0, 1fr\)/,
    );
    expect(RESUME_DOCUMENT_CSS).not.toMatch(
      /\.resume-skills\[data-layout="inline"\] \.resume-skill-name \{[\s\S]*?flex:\s*0 0 22mm/,
    );
    expect(RESUME_DOCUMENT_CSS).toMatch(
      /\.resume-skills\[data-layout="inline"\] \.resume-skill-items:only-child \{\s*grid-column:\s*1 \/ -1/,
    );
  });

  it("lets project tech stack follow body type", () => {
    expect(RESUME_DOCUMENT_CSS).toMatch(
      /\.resume-tech \{[\s\S]*?font-size:\s*var\(--resume-body-size\)/,
    );
    expect(RESUME_DOCUMENT_CSS).not.toMatch(/\.resume-tech \{[\s\S]*?font-family:\s*var\(--resume-font-mono\)/);
  });

  it("keeps experience company, position, and metadata in resilient columns", () => {
    expect(RESUME_DOCUMENT_CSS).toMatch(
      /\.resume-experience-heading \{[\s\S]*?grid-template-columns:\s*fit-content\(34%\) minmax\(0, 1fr\) fit-content\(42%\)/,
    );
    expect(RESUME_DOCUMENT_CSS).toMatch(
      /\.resume-experience-position \{[\s\S]*?grid-column:\s*2/,
    );
    expect(RESUME_DOCUMENT_CSS).toMatch(
      /\.resume-experience-meta \{[\s\S]*?grid-column:\s*3[\s\S]*?white-space:\s*normal/,
    );
  });

  it("keeps item subheadings quieter than body copy", () => {
    expect(RESUME_DOCUMENT_CSS).toMatch(
      /\.resume-subhead \{[\s\S]*?color:\s*var\(--resume-color-muted\)/,
    );
    expect(RESUME_DOCUMENT_CSS).toMatch(
      /\.resume-subhead \{[\s\S]*?font-size:\s*var\(--resume-meta-size\)/,
    );
  });

  it("separates project blocks while keeping their headings with their content", () => {
    expect(RESUME_DOCUMENT_CSS).toMatch(
      /\.resume-project-block \{[\s\S]*?margin-top:\s*calc\(var\(--resume-content-gap\) \+ 0\.8mm\)/,
    );
    expect(RESUME_DOCUMENT_CSS).toMatch(
      /\.resume-project-block > \.resume-subhead \{[\s\S]*?margin:\s*0 0 1mm/,
    );
    expect(RESUME_DOCUMENT_CSS).toMatch(
      /\.resume-project-block > \.resume-tech \{[\s\S]*?flex-wrap:\s*wrap/,
    );
  });

  it("keeps shared spread rows compact for projects and education", () => {
    expect(RESUME_DOCUMENT_CSS).toMatch(
      /\.resume-spread-middle \{[\s\S]*?flex:\s*1 1 auto[\s\S]*?white-space:\s*nowrap/,
    );
    expect(RESUME_DOCUMENT_CSS).toMatch(
      /\.resume-spread-meta\[data-tone="text"\],[\s\S]*?color:\s*var\(--resume-color-text\)/,
    );
    expect(RESUME_DOCUMENT_CSS).toMatch(
      /\.resume-spread-meta \{[\s\S]*?white-space:\s*nowrap/,
    );
    expect(RESUME_DOCUMENT_CSS).toMatch(
      /\.resume-spread-main \.resume-item-title \{[\s\S]*?white-space:\s*nowrap/,
    );
  });

  it("renders an explicit marker for resume bullet lists", () => {
    expect(RESUME_DOCUMENT_CSS).toMatch(
      /\.resume-bullets \{[\s\S]*?list-style:\s*none/,
    );
    expect(RESUME_DOCUMENT_CSS).toMatch(
      /\.resume-bullet::before \{[\s\S]*?content:\s*"•"/,
    );
  });
});
