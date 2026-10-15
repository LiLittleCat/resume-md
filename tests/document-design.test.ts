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
import { configFromSource, syncDocumentDesign, writeDesign } from "@/lib/document-design";
import { useEditorStore } from "@/store/editor-store";

const example = readFileSync(path.join(process.cwd(), "examples/resume.zh-CN.md"), "utf8");

describe("trailing design block", () => {
  it("appends a commented block after the user's Markdown", () => {
    const next = setDesignBlock(
      example,
      { theme: "kami", typography: { name: { fontSize: 22 } } },
      { comment: "managed by the panel" },
    );
    expect(next.startsWith(example.replace(/\s+$/, ""))).toBe(true);
    expect(next.endsWith(
      "\n\n<!-- resume-md:design managed by the panel\ntheme: kami\ntypography:\n  name:\n    fontSize: 22\n-->\n",
    )).toBe(true);
    expect(readDesignBlock(next)).toEqual({ theme: "kami", typography: { name: { fontSize: 22 } } });
    const parsed = parseResumeMarkdown(next);
    expect(parsed.design).toEqual({ theme: "kami", typography: { name: { fontSize: 22 } } });
    expect(parsed.resume).toEqual(parseResumeMarkdown(example).resume);
  });

  it("updates the block in place, keeps its note, and survives avatar edits", () => {
    let next = setDesignBlock(example, { theme: "kami" }, { comment: "note" });
    next = setDesignBlock(next, { theme: "modern" }, { comment: "other" });
    next = setFrontMatterAvatar(next, "https://cdn.example.com/me.jpg");
    expect(next.endsWith("<!-- resume-md:design note\ntheme: modern\n-->\n")).toBe(true);
    expect(next).not.toContain("other");
    expect(parseResumeMarkdown(next).resume.profile.avatar).toBe("https://cdn.example.com/me.jpg");
  });

  it("removes the block when the design is empty", () => {
    const withDesign = setDesignBlock(example, { theme: "kami" });
    expect(setDesignBlock(withDesign, {})).toBe(example.replace(/\n+$/, "\n"));
    expect(stripDesignBlock("# A\n\n<!-- resume-md:design\ntheme: kami\n-->\n\n# B\n")).toBe("# A\n\n# B\n");
    expect(setDesignBlock("", { theme: "kami" })).toBe("<!-- resume-md:design\ntheme: kami\n-->\n");
  });

  it("ignores an invalid block with a warning and reports it as unreadable", () => {
    const broken = `${example}\n<!-- resume-md:design\ntheme: 42\n-->\n`;
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
  it("keeps the previous config when the front matter is mid-edit", () => {
    const previous = { locale: "en-US" as const, theme: "kami" as const };
    expect(configFromSource("# A\n<!-- resume-md:design\ntheme: [\n-->\n", previous)).toBe(previous);
    expect(configFromSource(example, previous)).toEqual({ locale: "en-US" });
  });

  it("migrates legacy stored overrides into the source, skipping old defaults", () => {
    const legacy = syncDocumentDesign(example, {
      locale: "zh-CN",
      theme: "minimal",
      spacingPreset: "normal",
      fonts: { latin: "Charter" },
    });
    expect(readDesignBlock(legacy.source)).toEqual({ fonts: { latin: "Charter" } });
    expect(legacy.config).toEqual({ locale: "zh-CN", fonts: { latin: "Charter" } });

    const defaults = syncDocumentDesign(example, { locale: "zh-CN", theme: "minimal" });
    expect(defaults.source).toBe(example);
  });

  it("lets a design block in the source win over the stored config", () => {
    const source = writeDesign(example, { theme: "classic" });
    expect(syncDocumentDesign(source, { locale: "en-US", theme: "kami" })).toEqual({
      source,
      config: { locale: "en-US", theme: "classic" },
    });
  });
});

describe("editor store", () => {
  it("writes design changes into the source and reads them back", () => {
    const store = useEditorStore.getState();
    store.loadDocument(example, { locale: "zh-CN" });
    expect(useEditorStore.getState().source).toBe(example);

    store.patchConfig({ typography: { name: { fontSize: 24 } } });
    expect(readDesignBlock(useEditorStore.getState().source)).toEqual({
      typography: { name: { fontSize: 24 } },
    });
    expect(useEditorStore.getState().source).toContain("<!-- resume-md:design 设计参数");

    store.patchConfig({ locale: "en-US" });
    expect(useEditorStore.getState().config.locale).toBe("en-US");

    store.resetConfigPath(["typography", "name", "fontSize"]);
    expect(useEditorStore.getState().source).toBe(example.replace(/\n+$/, "\n"));

    store.setSource(writeDesign(example, { theme: "kami" }));
    expect(useEditorStore.getState().config).toEqual({ locale: "en-US", theme: "kami" });
  });
});
