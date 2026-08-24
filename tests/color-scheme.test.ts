import { describe, expect, it } from "vitest";
import { resolveColorScheme } from "@/lib/color-scheme";

describe("resolveColorScheme", () => {
  it("honors an explicit preference", () => {
    expect(resolveColorScheme("light", true)).toBe("light");
    expect(resolveColorScheme("dark", false)).toBe("dark");
  });

  it("follows the system preference", () => {
    expect(resolveColorScheme("system", true)).toBe("dark");
    expect(resolveColorScheme("system", false)).toBe("light");
  });
});
