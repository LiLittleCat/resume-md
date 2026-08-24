import type { CSSProperties } from "react";
import { RESUME_DOCUMENT_CSS, toDocumentCssVars, toSectionCssVars } from "@/core/renderer";
import type {
  ExperienceLayout,
  LocaleDefinition,
  Resume,
  ResumeSection,
  SectionId,
  SkillsLayout,
} from "@/core/schema";
import type { ResolvedDocumentStyle } from "@/core/style";
import { EducationBody } from "./education-section";
import { ExperienceBody } from "./experience-section";
import { GenericBody } from "./generic-section";
import { ResumeHeader } from "./header";
import { ProjectsBody } from "./project-section";
import { SectionHeading } from "./section-heading";
import { SkillsBody } from "./skills-section";
import { SummaryBody } from "./summary-section";

export function ResumeDocument({
  resume,
  style,
  locale,
  padded = true,
  selectedSectionId,
  selectedSectionTitle,
  onSelectSection,
}: {
  resume: Resume;
  style: ResolvedDocumentStyle;
  locale: LocaleDefinition;
  padded?: boolean;
  selectedSectionId?: SectionId | null;
  selectedSectionTitle?: string | null;
  onSelectSection?: (id: SectionId | null, title?: string | null) => void;
}) {
  const vars = toDocumentCssVars(style);

  return (
    <article
      className={`resume-root${padded ? " resume-page-pad" : ""}`}
      lang={locale.id === "zh-CN" ? "zh-CN" : "en-US"}
      style={vars as CSSProperties}
    >
      <style>{RESUME_DOCUMENT_CSS}</style>
      <ResumeHeader profile={resume.profile} style={style} locale={locale} />
      {resume.sections.map((section) => (
        <ResumeSectionView
          key={`${section.id}-${section.title}`}
          section={section}
          style={style}
          locale={locale}
          selected={
            selectedSectionId === section.id &&
            (section.id !== "custom" || selectedSectionTitle === section.title)
          }
          onSelect={onSelectSection}
        />
      ))}
    </article>
  );
}

function ResumeSectionView({
  section,
  style,
  locale,
  selected,
  onSelect,
}: {
  section: ResumeSection;
  style: ResolvedDocumentStyle;
  locale: LocaleDefinition;
  selected: boolean;
  onSelect?: (id: SectionId | null, title?: string | null) => void;
}) {
  const sectionStyle = style.sections[section.id];
  const vars = toSectionCssVars(sectionStyle);

  return (
    <section
      className="resume-section"
      data-section-id={section.id}
      data-section-title={section.title}
      data-selected={selected ? "true" : "false"}
      style={vars as CSSProperties}
      onClick={
        onSelect
          ? (event) => {
              event.stopPropagation();
              onSelect(section.id, section.title);
            }
          : undefined
      }
    >
      <SectionHeading
        title={section.title}
        icon={sectionStyle.icon}
        showIcon={sectionStyle.showSectionIcon}
        transform={style.components.sectionTitle.transform}
        rule={style.components.sectionTitle.rule}
      />
      <SectionBody section={section} layout={sectionStyle.layout} locale={locale} />
    </section>
  );
}

function SectionBody({
  section,
  layout,
  locale,
}: {
  section: ResumeSection;
  layout: string | undefined;
  locale: LocaleDefinition;
}) {
  switch (section.id) {
    case "summary":
      return <SummaryBody section={section} />;
    case "skills":
      return <SkillsBody section={section} layout={asSkillsLayout(layout)} />;
    case "experience":
      return (
        <ExperienceBody
          items={section.items}
          layout={asExperienceLayout(layout)}
          locale={locale}
        />
      );
    case "projects":
      return <ProjectsBody items={section.items} locale={locale} />;
    case "education":
      return <EducationBody items={section.items} locale={locale} />;
    default:
      return <GenericBody section={section} locale={locale} />;
  }
}

function asExperienceLayout(value: string | undefined): ExperienceLayout {
  return value === "stacked" ? "stacked" : "default";
}

function asSkillsLayout(value: string | undefined): SkillsLayout {
  return value === "stacked" || value === "columns" ? "stacked" : "inline";
}
