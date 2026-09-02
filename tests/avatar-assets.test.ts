import { describe, expect, it } from "vitest";
import { parseResumeMarkdown } from "@/core/parser";
import {
  AVATAR_REFERENCE_PREFIX,
  compileResumeWithAvatarAssets,
  externalizeAvatarSource,
  materializeAvatarSource,
  resolveAvatarAsset,
  storeAvatarAsset,
  type AvatarAssetStore,
} from "@/lib/avatar-assets";

function memoryStore(): AvatarAssetStore & { data: Record<string, string> } {
  const data: Record<string, string> = {};
  return {
    data,
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value;
    },
  };
}

const sourceWithAvatar = (avatar: string) => `---\nname: Ada\navatar: ${avatar}\n---\n`;

describe("avatar assets", () => {
  it("stores image data outside Markdown behind a short reference", () => {
    const store = memoryStore();
    const dataUrl = "data:image/png;base64,iVBORw0KGgoAAA";
    const reference = storeAvatarAsset(store, dataUrl, "avatar-1");

    expect(reference).toBe(`${AVATAR_REFERENCE_PREFIX}avatar-1`);
    expect(reference).not.toContain("base64");
    expect(resolveAvatarAsset(reference, store)).toBe(dataUrl);
  });

  it("automatically externalizes an existing embedded avatar", () => {
    const store = memoryStore();
    const dataUrl = "data:image/png;base64,iVBORw0KGgoAAA";
    const migrated = externalizeAvatarSource(sourceWithAvatar(dataUrl), store, "migrated");

    expect(migrated.changed).toBe(true);
    expect(migrated.source).not.toContain("base64");
    expect(parseResumeMarkdown(migrated.source).resume.profile.avatar).toBe(
      `${AVATAR_REFERENCE_PREFIX}migrated`,
    );
  });

  it("resolves the same PNG for preview and materializes it for PDF export", () => {
    const store = memoryStore();
    const dataUrl = "data:image/png;base64,iVBORw0KGgoAAA";
    const reference = storeAvatarAsset(store, dataUrl, "transparent-png");
    const source = sourceWithAvatar(reference);

    const compiled = compileResumeWithAvatarAssets({ source }, store);
    const exportSource = materializeAvatarSource(source, store);

    expect(compiled.resume.profile.avatar).toBe(dataUrl);
    expect(exportSource).not.toBeNull();
    expect(parseResumeMarkdown(exportSource!).resume.profile.avatar).toBe(dataUrl);
    expect(source).not.toContain("base64");
  });

  it("reports a missing local asset instead of exporting a broken reference", () => {
    const store = memoryStore();
    const source = sourceWithAvatar(`${AVATAR_REFERENCE_PREFIX}missing`);

    expect(materializeAvatarSource(source, store)).toBeNull();
    expect(compileResumeWithAvatarAssets({ source }, store).resume.profile.avatar).toBeUndefined();
  });
});
