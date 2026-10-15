import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { compileResume } from "@/core/compile";
import {
  parseResumeMarkdown,
  readDesignBlock,
  setDesignBlock,
  setFrontMatterAvatar,
  stripDesignBlock,
} from "@/core/parser";
import {
  composeDocument,
  designBlockText,
  splitDocument,
  syncDocumentDesign,
} from "@/lib/document-design";
import { useEditorStore } from "@/store/editor-store";

const example = readFileSync(path.join(process.cwd(), "examples/resume.zh-CN.md"), "utf8");

describe("design block", () => {
  it("puts a commented block at the very top, ahead of the front matter", () => {
    const next = setDesignBlock(
      example,
      { theme: "kami", typography: { name: { fontSize: 22 } } },
      { comment: "managed by the panel" },
    );
    expect(next).toBe(
      `<!-- resume-md:design managed by the panel\ntheme: kami\ntypography:\n  name:\n    fontSize: 22\n-->\n\n${example}`,
    );
    expect(readDesignBlock(next)).toEqual({ theme: "kami", typography: { name: { fontSize: 22 } } });
    const parsed = parseResumeMarkdown(next);
    expect(parsed.design).toEqual({ theme: "kami", typography: { name: { fontSize: 22 } } });
    expect(parsed.resume).toEqual(parseResumeMarkdown(example).resume);
  });

  it("moves an older trailing block to the top and keeps its note", () => {
    const trailing = `${example}\n<!-- resume-md:design note\ntheme: kami\n-->\n`;
    const next = setDesignBlock(trailing, { theme: "modern" }, { comment: "other" });
    expect(next).toBe(`<!-- resume-md:design note\ntheme: modern\n-->\n\n${example}`);
    expect(setFrontMatterAvatar(stripDesignBlock(next), "https://cdn.example.com/me.jpg")).toContain(
      "avatar: https://cdn.example.com/me.jpg",
    );
  });

  it("removes the block when the design is empty", () => {
    expect(setDesignBlock(setDesignBlock(example, { theme: "kami" }), {})).toBe(example);
    expect(stripDesignBlock("# A\n\n<!-- resume-md:design\ntheme: kami\n-->\n\n# B\n")).toBe("# A\n\n# B\n");
    expect(setDesignBlock("", { theme: "kami" })).toBe("<!-- resume-md:design\ntheme: kami\n-->\n");
  });

  it("ignores an invalid block with a warning and reports it as unreadable", () => {
    const broken = `<!-- resume-md:design\ntheme: 42\n-->\n\n${example}`;
    expect(readDesignBlock(broken)).toBeNull();
    const parsed = parseResumeMarkdown(broken);
    expect(parsed.design).toEqual({});
    expect(parsed.resume.profile.name).toBe("张三");
    expect(parsed.warnings.map((w) => w.code)).toContain("design-block");
  });

  it("compiles the source design without a separate config", () => {
    const source = setDesignBlock(example, { theme: "kami" });
    expect(compileResume({ source }).theme.id).toBe("kami");
    expect(compileResume({ source, config: { theme: "modern" } }).theme.id).toBe("modern");
  });
});

describe("document design sync", () => {
  it("splits a pasted document into editor text and config", () => {
    const previous = { locale: "en-US" as const, theme: "kami" as const };
    const pasted = composeDocument(example, { theme: "classic" });
    expect(splitDocument(pasted, previous)).toEqual({
      source: example,
      config: { locale: "en-US", theme: "classic" },
    });
    expect(splitDocument(example, previous)).toEqual({ source: example, config: previous });
    const broken = `<!-- resume-md:design\ntheme: [\n-->\n${example}`;
    expect(splitDocument(broken, previous)).toEqual({ source: broken, config: previous });
  });

  it("composes the stored document with a localized note, and nothing for defaults", () => {
    expect(composeDocument(example, { locale: "zh-CN" })).toBe(example);
    expect(designBlockText({ locale: "zh-CN" })).toBe("");
    expect(designBlockText({ locale: "zh-CN", theme: "kami" })).toBe(
      "<!-- resume-md:design 设计参数：由设计面板自动维护，请勿手动编辑\ntheme: kami\n-->",
    );
  });

  it("uses legacy stored overrides when the source has no block, skipping old defaults", () => {
    expect(
      syncDocumentDesign(example, {
        locale: "zh-CN",
        theme: "minimal",
        spacingPreset: "normal",
        fonts: { latin: "Charter" },
      }),
    ).toEqual({ source: example, config: { locale: "zh-CN", fonts: { latin: "Charter" } } });
  });

  it("lets a design block in the source win over the stored config", () => {
    const stored = composeDocument(example, { theme: "classic" });
    expect(syncDocumentDesign(stored, { locale: "en-US", theme: "kami" })).toEqual({
      source: example,
      config: { locale: "en-US", theme: "classic" },
    });
  });
});

describe("editor store", () => {
  it("keeps the design block out of the editor text", () => {
    const store = useEditorStore.getState();
    store.loadDocument(composeDocument(example, { theme: "kami" }), { locale: "zh-CN" });
    expect(useEditorStore.getState().source).toBe(example);
    expect(useEditorStore.getState().config).toEqual({ locale: "zh-CN", theme: "kami" });

    store.patchConfig({ typography: { name: { fontSize: 24 } } });
    expect(useEditorStore.getState().source).toBe(example);

    store.setSource(composeDocument(example, { theme: "classic" }));
    expect(useEditorStore.getState().source).toBe(example);
    expect(useEditorStore.getState().config).toEqual({ locale: "zh-CN", theme: "classic" });
  });
});
