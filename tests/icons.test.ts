import { describe, expect, it } from "vitest";
import { getLucideIcon, isFilledResumeIcon } from "@/components/resume/icons";

describe("resume icons", () => {
  it("uses brand marks for github and linkedin", () => {
    expect(isFilledResumeIcon("github")).toBe(true);
    expect(isFilledResumeIcon("linkedin")).toBe(true);
    expect(isFilledResumeIcon("website")).toBe(false);
    expect(getLucideIcon("github").displayName).toBe("GithubMark");
    expect(getLucideIcon("linkedin").displayName).toBe("LinkedinMark");
  });
});
