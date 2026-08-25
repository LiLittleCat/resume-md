import { describe, expect, it } from "vitest";
import { formatRelativeTime } from "@/lib/relative-time";

describe("formatRelativeTime", () => {
  it("uses relative units for recent timestamps", () => {
    const now = Date.parse("2026-08-25T12:00:00.000Z");
    expect(formatRelativeTime(now - 10_000, "en-US", now)).toMatch(/second|now/i);
    expect(formatRelativeTime(now - 5 * 60_000, "en-US", now)).toMatch(/5 minutes/i);
  });

  it("falls back to a calendar date for older timestamps", () => {
    const now = Date.parse("2026-08-25T12:00:00.000Z");
    const formatted = formatRelativeTime(Date.parse("2026-01-02T00:00:00.000Z"), "en-US", now);
    expect(formatted).toMatch(/Jan/);
  });
});
