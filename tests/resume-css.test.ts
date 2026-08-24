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
    expect(RESUME_DOCUMENT_CSS).toMatch(/\.resume-icon\s*\{[\s\S]*?text-transform:\s*none/);
    expect(RESUME_DOCUMENT_CSS).toMatch(
      /\.resume-icon\[data-filled="true"\] svg \{[\s\S]*?fill:\s*currentColor/,
    );
  });
});
