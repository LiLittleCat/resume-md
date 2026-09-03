import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  EnvelopeSimpleIcon,
  FolderIcon,
  GithubLogoIcon,
  GlobeSimpleIcon,
  PhoneIcon,
  UserIcon,
} from "@phosphor-icons/react/ssr";
import { describe, expect, it } from "vitest";
import { ResumeGlyph } from "@/components/resume/resume-icon";
import {
  getLucideIcon,
  getPhosphorIcon,
  getResumeIcon,
  isFilledResumeIcon,
} from "@/components/resume/icons";

describe("resume icons", () => {
  it("uses brand marks for github and linkedin", () => {
    expect(isFilledResumeIcon("github")).toBe(true);
    expect(isFilledResumeIcon("linkedin")).toBe(true);
    expect(isFilledResumeIcon("website")).toBe(false);
    expect(getLucideIcon("github").displayName).toBe("GithubMark");
    expect(getLucideIcon("linkedin").displayName).toBe("LinkedinMark");
  });

  it("uses Phosphor as the default resume icon provider", () => {
    expect(getResumeIcon("phosphor", "briefcase")).toBe(getPhosphorIcon("briefcase"));
    expect(getResumeIcon("lucide", "briefcase")).toBe(getLucideIcon("briefcase"));

    const html = renderToStaticMarkup(createElement(ResumeGlyph, { icon: "briefcase" }));
    expect(html).toContain('data-icon-provider="phosphor"');
    expect(html).toContain("<svg");
  });

  it("keeps Phosphor brand marks in the regular style", () => {
    const html = renderToStaticMarkup(
      createElement(ResumeGlyph, { icon: "github", provider: "phosphor" }),
    );
    expect(html).toContain('data-icon-provider="phosphor"');
    expect(html).not.toContain('data-filled="true"');
  });

  it("uses the selected simple Phosphor contact icons", () => {
    expect(getPhosphorIcon("phone")).toBe(PhoneIcon);
    expect(getPhosphorIcon("email")).toBe(EnvelopeSimpleIcon);
    expect(getPhosphorIcon("github")).toBe(GithubLogoIcon);
    expect(getPhosphorIcon("website")).toBe(GlobeSimpleIcon);
  });

  it("uses UserIcon for the summary section", () => {
    expect(getPhosphorIcon("summary")).toBe(UserIcon);
  });

  it("uses FolderIcon for project sections", () => {
    expect(getPhosphorIcon("project")).toBe(FolderIcon);
  });
});
