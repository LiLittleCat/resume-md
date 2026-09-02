import { describe, expect, it } from "vitest";
import { avatarOutputMimeType } from "@/lib/avatar-file";

describe("avatarOutputMimeType", () => {
  it("preserves PNG uploads so their alpha channel reaches the PDF", () => {
    expect(avatarOutputMimeType("image/png")).toBe("image/png");
  });

  it("keeps the existing compressed JPEG path for opaque formats", () => {
    expect(avatarOutputMimeType("image/jpeg")).toBe("image/jpeg");
    expect(avatarOutputMimeType("image/webp")).toBe("image/jpeg");
  });
});
