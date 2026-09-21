import { describe, expect, it } from "vitest";
import {
  defaultExportBasename,
  exportPdfFilename,
  pdfContentDisposition,
  resolveExportBasename,
  sanitizeExportBasename,
} from "@/lib/export-filename";

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

describe("resolveExportBasename", () => {
  it("prefers a requested name and otherwise uses the profile default", () => {
    expect(resolveExportBasename("自定义", "Jane Doe")).toBe("自定义");
    expect(resolveExportBasename("  ", "Jane Doe")).toBe("Jane-Doe");
    expect(resolveExportBasename(undefined, "Jane Doe")).toBe("Jane-Doe");
  });
});

describe("exportPdfFilename", () => {
  it("always appends a single .pdf extension", () => {
    expect(exportPdfFilename("resume.pdf")).toBe("resume.pdf");
    expect(exportPdfFilename("简历")).toBe("简历.pdf");
  });
});

describe("pdfContentDisposition", () => {
  it("keeps an ASCII fallback and a UTF-8 filename*", () => {
    expect(pdfContentDisposition("张三")).toBe(
      "attachment; filename=\"resume.pdf\"; filename*=UTF-8''%E5%BC%A0%E4%B8%89.pdf",
    );
    expect(pdfContentDisposition("Jane Doe")).toBe(
      "attachment; filename=\"Jane-Doe.pdf\"; filename*=UTF-8''Jane%20Doe.pdf",
    );
  });
});
