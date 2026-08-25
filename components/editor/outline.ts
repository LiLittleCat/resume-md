import type { Resume, ResumeSection, SectionId } from "@/core/schema";

export type OutlineEntry = {
  title: string;
  depth: 1 | 2;
  sectionId: SectionId;
  sectionTitle: string;
};

export function isOutlineEntrySelected(
  entry: OutlineEntry,
  selection: {
    sectionId: SectionId | null;
    sectionTitle: string | null;
    heading: { title: string; depth: 1 | 2 } | null;
  },
): boolean {
  if (selection.sectionId !== entry.sectionId) return false;
  if (entry.sectionId === "custom" && selection.sectionTitle !== entry.sectionTitle) return false;
  if (!selection.heading) return entry.depth === 1;
  return entry.title === selection.heading.title && entry.depth === selection.heading.depth;
}

export function outlineEntries(resume: Resume): OutlineEntry[] {
  const entries: OutlineEntry[] = [];
  for (const section of resume.sections) {
    entries.push({
      title: section.title,
      depth: 1,
      sectionId: section.id,
      sectionTitle: section.title,
    });
    for (const child of childTitles(section)) {
      entries.push({
        title: child,
        depth: 2,
        sectionId: section.id,
        sectionTitle: section.title,
      });
    }
  }
  return entries;
}

function childTitles(section: ResumeSection): string[] {
  switch (section.id) {
    case "skills":
      return section.groups.map((group) => group.name).filter(Boolean);
    case "experience":
      return section.items.map((item) => item.company);
    case "projects":
      return section.items.map((item) => item.name);
    case "education":
      return section.items.map((item) => item.school);
    case "summary":
      return [];
    default:
      return section.items.map((item) => item.title);
  }
}
