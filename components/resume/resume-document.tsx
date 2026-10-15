import type { CSSProperties } from "react";
import {
  RESUME_DOCUMENT_CSS,
  documentFontStylesheets,
  toDocumentCssVars,
  toSectionCssVars,
} from "@/core/renderer";
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
}: {
  resume: Resume;
  style: ResolvedDocumentStyle;
  locale: LocaleDefinition;
  padded?: boolean;
  selectedSectionId?: SectionId | null;
  selectedSectionTitle?: string | null;
}) {
  const vars = toDocumentCssVars(style);

  return (
    // translate="no" keeps browser translation extensions from injecting translated copies
    // of the resume text into the preview and the exported PDF.
    <article
      className={`resume-root notranslate${padded ? " resume-page-pad" : ""}`}
      lang={locale.id === "zh-CN" ? "zh-CN" : "en-US"}
      translate="no"
      data-theme={style.themeId}
      style={vars as CSSProperties}
    >
      {documentFontStylesheets(style.fonts).map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      <style>{RESUME_DOCUMENT_CSS}</style>
      <ResumeHeader profile={resume.profile} style={style} locale={locale} />
      {resume.sections.map((section, index) => (
        <ResumeSectionView
          key={`${index}-${section.id}-${section.title}`}
          section={section}
          style={style}
          locale={locale}
          selected={
            selectedSectionId === section.id &&
            (section.id !== "custom" || selectedSectionTitle === section.title)
          }
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
}: {
  section: ResumeSection;
  style: ResolvedDocumentStyle;
  locale: LocaleDefinition;
  selected: boolean;
}) {
  const sectionStyle = style.sections[section.id];
  const vars = toSectionCssVars(sectionStyle);

  return (
    <section
      className="resume-section"
      data-section-id={section.id}
      data-section-title={section.title}
      data-outline-title={section.title}
      data-outline-depth="1"
      data-selected={selected ? "true" : "false"}
      style={vars as CSSProperties}
    >
      <SectionHeading
        title={section.title}
        icon={sectionStyle.icon}
        provider={style.icons.provider}
        showIcon={sectionStyle.showSectionIcon}
        transform={style.components.sectionTitle.transform}
        rule={style.components.sectionTitle.rule}
        keepWithNext={style.pagination.keepSectionTitleWithBody}
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
