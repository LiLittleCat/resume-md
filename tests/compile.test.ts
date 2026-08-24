import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { compileResume } from "@/core/compile";

describe("compileResume", () => {
  it("produces a resolved style for the Chinese example", () => {
    const source = readFileSync(path.join(process.cwd(), "examples/resume.zh-CN.md"), "utf8");
    const compiled = compileResume({ source, config: { theme: "minimal" } });
    expect(compiled.resume.sections).toHaveLength(5);
    expect(compiled.style.page.widthMm).toBe(210);
    expect(compiled.style.page.heightMm).toBe(297);
    expect(compiled.locale.id).toBe("zh-CN");
    expect(compiled.style.sections.experience.icon).toBe("briefcase");
  });

  it("keeps the summary icon when compiling the modern theme", () => {
    const source = readFileSync(path.join(process.cwd(), "examples/resume.zh-CN.md"), "utf8");
    const compiled = compileResume({ source, config: { theme: "modern" } });
    expect(compiled.resume.sections[0]?.id).toBe("summary");
    expect(compiled.style.sections.summary.showSectionIcon).toBe(true);
    expect(compiled.style.sections.summary.icon).toBe("summary");
    expect(compiled.style.components.sectionTitle.transform).toBe("uppercase");
  });
});
