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
      /\.resume-root \.resume-avatar\[data-shape="circle"\] \{\s*border-radius:\s*50%/,
    );
  });

  it("lets project tech stack follow body type", () => {
    expect(RESUME_DOCUMENT_CSS).toMatch(
      /\.resume-tech \{[\s\S]*?font-size:\s*var\(--resume-body-size\)/,
    );
    expect(RESUME_DOCUMENT_CSS).not.toMatch(/\.resume-tech \{[\s\S]*?font-family:\s*var\(--resume-font-mono\)/);
  });

  it("does not render project subheadings smaller than body copy", () => {
    expect(RESUME_DOCUMENT_CSS).toMatch(
      /\.resume-subhead \{[\s\S]*?font-size:\s*var\(--resume-body-size\)/,
    );
    expect(RESUME_DOCUMENT_CSS).toMatch(
      /\.resume-subhead \{[\s\S]*?color:\s*var\(--resume-color-text\)/,
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

  it("places item roles between titles and full-color dates", () => {
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
