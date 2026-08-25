import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ResumeConfigSchema } from "@/core/schema";
import {
  createResumeDocument,
  deleteResumeDocument,
  duplicateResumeDocument,
  emptyLibrary,
  hydrateResumeLibrary,
  LEGACY_EDITOR_STORAGE_KEY,
  EDITOR_STORAGE_KEY,
  listResumeDocuments,
  persistResumeLibrary,
  resumeDocumentName,
  resumeDocumentRole,
  seedLibrary,
  setActiveResume,
  updateResumeChrome,
  updateResumeDocument,
  withDocumentLocale,
  type KeyValueStore,
  type ResumeLibrary,
} from "@/lib/resume-storage";

const examplesDir = path.join(process.cwd(), "examples");
const zhSource = readFileSync(path.join(examplesDir, "resume.zh-CN.md"), "utf8");
const enSource = readFileSync(path.join(examplesDir, "resume.en-US.md"), "utf8");
const defaultConfig = ResumeConfigSchema.parse(
  JSON.parse(readFileSync(path.join(examplesDir, "resume.config.json"), "utf8")),
);

function memoryStore(initial: Record<string, string> = {}): KeyValueStore & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value;
    },
  };
}

function seed() {
  return { source: zhSource, config: defaultConfig, id: "seed", now: 1000 };
}

describe("resume document title", () => {
  it("reads the profile name and role", () => {
    expect(resumeDocumentName(zhSource, "未命名简历")).toBe("张三");
    expect(resumeDocumentRole(zhSource)).toBe("后端开发工程师");
    expect(resumeDocumentName("---\nname: \n---\n", "未命名简历")).toBe("未命名简历");
  });
});

describe("withDocumentLocale", () => {
  it("keeps an explicit config locale", () => {
    expect(withDocumentLocale(zhSource, { locale: "en-US" }).locale).toBe("en-US");
  });

  it("fills locale from front matter when config omits it", () => {
    expect(withDocumentLocale("---\nname: Ada\nlocale: en-US\n---\n", {}).locale).toBe("en-US");
  });
});

describe("hydrateResumeLibrary", () => {
  it("seeds a Chinese example when storage is empty", () => {
    const store = memoryStore();
    const library = hydrateResumeLibrary(store, seed());
    expect(library.activeId).toBe("seed");
    expect(library.documents.seed.source).toBe(zhSource);
    expect(JSON.parse(store.data[EDITOR_STORAGE_KEY] as string).version).toBe(4);
  });

  it("migrates the v3 singleton into one document", () => {
    const store = memoryStore({
      [LEGACY_EDITOR_STORAGE_KEY]: JSON.stringify({
        source: zhSource,
        config: { theme: "modern", locale: "zh-CN" },
        leftPanelWidth: 400,
        rightPanelWidth: 240,
        colorScheme: "dark",
      }),
    });
    const library = hydrateResumeLibrary(store, seed());
    expect(library.activeId).toBe("seed");
    expect(library.documents.seed.source).toBe(zhSource);
    expect(library.documents.seed.config.theme).toBe("modern");
    expect(library.chrome).toEqual({
      colorScheme: "dark",
      leftPanelWidth: 400,
      rightPanelWidth: 240,
    });
    expect(store.data[EDITOR_STORAGE_KEY]).toBeTruthy();
  });

  it("does not re-seed an empty v4 library", () => {
    const empty = emptyLibrary({ colorScheme: "light" });
    const store = memoryStore({ [EDITOR_STORAGE_KEY]: JSON.stringify(empty) });
    const library = hydrateResumeLibrary(store, seed());
    expect(library.documents).toEqual({});
    expect(library.activeId).toBeNull();
    expect(library.chrome.colorScheme).toBe("light");
  });

  it("falls back to v3 when v4 JSON is corrupt", () => {
    const store = memoryStore({
      [EDITOR_STORAGE_KEY]: "{not-json",
      [LEGACY_EDITOR_STORAGE_KEY]: JSON.stringify({ source: enSource, config: { locale: "en-US" } }),
    });
    const library = hydrateResumeLibrary(store, seed());
    expect(library.documents.seed.source).toBe(enSource);
  });

  it("repairs a missing activeId", () => {
    const store = memoryStore({
      [EDITOR_STORAGE_KEY]: JSON.stringify({
        version: 4,
        activeId: "gone",
        chrome: { colorScheme: "system" },
        documents: {
          a: { id: "a", source: zhSource, config: {}, createdAt: 1, updatedAt: 2 },
        },
      }),
    });
    const library = hydrateResumeLibrary(store, seed());
    expect(library.activeId).toBe("a");
  });
});

describe("resume library mutations", () => {
  function twoDocs(): ResumeLibrary {
    const created = createResumeDocument(emptyLibrary(), {
      source: zhSource,
      config: defaultConfig,
      id: "a",
      now: 1,
    });
    return createResumeDocument(created.library, {
      source: enSource,
      config: { ...defaultConfig, locale: "en-US" },
      id: "b",
      now: 2,
    }).library;
  }

  it("lists newest first and keeps edits on one document", () => {
    let library = twoDocs();
    expect(listResumeDocuments(library).map((doc) => doc.id)).toEqual(["b", "a"]);
    library = updateResumeDocument(library, "a", { source: "# 李四\n" }, 50);
    expect(library.documents.a.source).toContain("李四");
    expect(library.documents.b.source).toBe(enSource);
    expect(library.documents.a.updatedAt).toBe(50);
    expect(listResumeDocuments(library)[0]?.id).toBe("a");
  });

  it("duplicates without activating, then deletes down to empty", () => {
    let library = twoDocs();
    const duplicated = duplicateResumeDocument(library, "a", { id: "a-copy", now: 9 });
    expect(duplicated).not.toBeNull();
    library = duplicated!.library;
    expect(library.activeId).toBe("b");
    expect(library.documents["a-copy"]?.source).toBe(zhSource);

    library = deleteResumeDocument(library, "b");
    expect(library.activeId).toBe("a-copy");
    library = deleteResumeDocument(library, "a-copy");
    library = deleteResumeDocument(library, "a");
    expect(library.activeId).toBeNull();
    expect(Object.keys(library.documents)).toEqual([]);
  });

  it("setActive ignores unknown ids", () => {
    const library = twoDocs();
    expect(setActiveResume(library, "missing").activeId).toBe("b");
    expect(setActiveResume(library, "a").activeId).toBe("a");
  });

  it("updates chrome without touching documents", () => {
    const library = updateResumeChrome(twoDocs(), { colorScheme: "light", leftPanelWidth: 360 });
    expect(library.chrome.colorScheme).toBe("light");
    expect(library.chrome.leftPanelWidth).toBe(360);
    expect(library.documents.a.source).toBe(zhSource);
  });
});

describe("persistResumeLibrary", () => {
  it("reports quota failures", () => {
    const store: KeyValueStore = {
      getItem: () => null,
      setItem: () => {
        const error = new Error("full");
        error.name = "QuotaExceededError";
        throw error;
      },
    };
    expect(persistResumeLibrary(store, seedLibrary(seed()))).toEqual({
      ok: false,
      reason: "quota",
    });
  });
});
