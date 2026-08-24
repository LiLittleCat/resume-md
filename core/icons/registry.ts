import type { ContactField, ResumeIcon, SectionId } from "../schema";
import { RESUME_ICONS } from "../schema";

export const DEFAULT_SECTION_ICONS: Record<SectionId, ResumeIcon> = {
  summary: "summary",
  skills: "code",
  experience: "briefcase",
  projects: "project",
  education: "education",
  openSource: "code",
  awards: "award",
  certifications: "certificate",
  publications: "education",
  languages: "language",
  interests: "profile",
  custom: "blocks",
};

export const DEFAULT_CONTACT_ICONS: Record<ContactField, ResumeIcon> = {
  phone: "phone",
  email: "email",
  location: "location",
  github: "github",
  linkedin: "linkedin",
  website: "website",
};

export const RECOMMENDED_SECTION_ICONS: Record<SectionId, readonly ResumeIcon[]> = {
  summary: ["summary", "profile"],
  skills: ["code", "braces", "wrench"],
  experience: ["briefcase", "company"],
  projects: ["project", "rocket", "blocks"],
  education: ["education", "school"],
  openSource: ["code", "github", "project"],
  awards: ["award", "trophy", "medal"],
  certifications: ["certificate", "award"],
  publications: ["education", "project"],
  languages: ["language"],
  interests: ["profile"],
  custom: ["blocks", "project", "profile"],
};

export const RECOMMENDED_ICON_GROUPS: Record<string, readonly ResumeIcon[]> = {
  summary: ["summary", "profile"],
  skills: ["code", "skills"],
  experience: ["briefcase", "company"],
  projects: ["project"],
  education: ["education"],
  awards: ["award", "certificate"],
};

export function allResumeIcons(): readonly ResumeIcon[] {
  return RESUME_ICONS;
}

export function recommendedIconsFor(sectionId: SectionId): readonly ResumeIcon[] {
  return RECOMMENDED_SECTION_ICONS[sectionId];
}
