import type { LocaleDefinition } from "@/core/schema";

export const enUS: LocaleDefinition = {
  id: "en-US",
  name: "English",
  labels: {
    summary: "Summary",
    skills: "Skills",
    experience: "Experience",
    projects: "Projects",
    education: "Education",
    openSource: "Open Source",
    awards: "Awards",
    certifications: "Certifications",
    publications: "Publications",
    languages: "Languages",
    interests: "Interests",
    custom: "Other",
    present: "Present",
    responsibilities: "Responsibilities",
    achievements: "Achievements",
    techStack: "Tech stack",
    description: "Overview",
  },
  date: {
    format: "en-short",
  },
  typographyPreset: {
    base: { lineHeight: 1.35 },
    body: { lineHeight: 1.35 },
    name: { letterSpacing: -0.02 },
  },
};
