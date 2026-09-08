import { describe, expect, it } from "vitest";
import {
  avatarOutputMimeType,
  compositeRgbaOverBackground,
  shouldBakeAvatarSrc,
} from "@/lib/avatar-file";

describe("avatarOutputMimeType", () => {
  it("keeps PNG uploads so preview can still show true transparency", () => {
    expect(avatarOutputMimeType("image/png")).toBe("image/png");
  });

  it("keeps the existing compressed JPEG path for opaque formats", () => {
    expect(avatarOutputMimeType("image/jpeg")).toBe("image/jpeg");
    expect(avatarOutputMimeType("image/webp")).toBe("image/jpeg");
  });
});

describe("shouldBakeAvatarSrc", () => {
  it("bakes PNG data URLs onto the page color before Chromium PDF flatten-to-white", () => {
    expect(shouldBakeAvatarSrc("data:image/png;base64,AAAA")).toBe(true);
  });

  it("skips already-opaque JPEGs", () => {
    expect(shouldBakeAvatarSrc("data:image/jpeg;base64,AAAA")).toBe(false);
  });
});

describe("compositeRgbaOverBackground", () => {
  it("replaces fully transparent pixels with the resume paper color", () => {
    const pixels = new Uint8ClampedArray([0, 0, 0, 0]);

    compositeRgbaOverBackground(pixels, "#f5f4ed");

    expect([...pixels]).toEqual([245, 244, 237, 255]);
  });

  it("leaves opaque pixels unchanged", () => {
    const pixels = new Uint8ClampedArray([12, 34, 56, 255]);

    compositeRgbaOverBackground(pixels, "#fffdf8");

    expect([...pixels]).toEqual([12, 34, 56, 255]);
  });
});
