import { describe, expect, it } from "vitest";
import { defaultExportBasename, sanitizeExportBasename } from "@/lib/export-filename";

describe("defaultExportBasename", () => {
  it("hyphenates the profile name and falls back to resume", () => {
    expect(defaultExportBasename("Jane Doe")).toBe("Jane-Doe");
    expect(defaultExportBasename("  张三  ")).toBe("张三");
    expect(defaultExportBasename("")).toBe("resume");
    expect(defaultExportBasename(undefined)).toBe("resume");
  });
});

describe("sanitizeExportBasename", () => {
  it("strips a trailing pdf suffix and unsafe path characters", () => {
    expect(sanitizeExportBasename("张三-后端.pdf")).toBe("张三-后端");
    expect(sanitizeExportBasename("a/b\\c:d*e?f\"g<h>i|j")).toBe("abcdefghij");
    expect(sanitizeExportBasename("..hidden")).toBe("hidden");
  });

  it("keeps inner spaces the user typed and falls back when empty", () => {
    expect(sanitizeExportBasename("  Jane   Doe  ")).toBe("Jane Doe");
    expect(sanitizeExportBasename("   ")).toBe("resume");
    expect(sanitizeExportBasename("...")).toBe("resume");
  });
});
