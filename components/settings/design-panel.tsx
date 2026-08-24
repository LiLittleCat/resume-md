"use client";

import { useMemo } from "react";
import { compileResume } from "@/core/compile";
import { hasPath } from "@/core/style/merge";
import { resolveLocale } from "@/core/locale";
import type {
  EducationLayout,
  ExperienceLayout,
  IconMode,
  ProjectLayout,
  SectionId,
  SectionOverride,
  SkillsLayout,
  SpacingPreset,
} from "@/core/schema";
import { useUi, useUiLocale } from "@/components/editor/use-ui";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useEditorStore } from "@/store/editor-store";
import { Field, NumberSlider, PanelBlock, Segmented } from "./controls";
import { IconPicker } from "./icon-picker";

const LATIN_FONTS = ["Inter", "Source Serif 4"];
const CJK_FONTS = ["Noto Sans SC", "Noto Serif SC"];

export function DesignPanel() {
  const source = useEditorStore((state) => state.source);
  const config = useEditorStore((state) => state.config);
  const selectedSectionId = useEditorStore((state) => state.selectedSectionId);
  const selectedSectionTitle = useEditorStore((state) => state.selectedSectionTitle);
  const compiled = useMemo(() => {
    try {
      return compileResume({ source, config });
    } catch {
      return null;
    }
  }, [source, config]);
  const ui = useUi();
  const uiLocale = useUiLocale();
  const sectionTitle = selectedSectionId
    ? selectedSectionTitle || resolveLocale(uiLocale).labels[selectedSectionId]
    : ui.design;

  if (!compiled) {
    return <aside className="flex h-full items-center justify-center text-sm text-muted-foreground">{ui.noDocument}</aside>;
  }

  return (
    <aside className="flex h-full min-h-0 flex-col">
      <header className="flex h-11 items-center justify-between border-b border-border px-4">
        <p className="ui-kicker text-muted-foreground">
          {sectionTitle}
        </p>
        {selectedSectionId ? (
          <button
            type="button"
            className="text-[11px] text-muted-foreground hover:text-foreground"
            onClick={() => useEditorStore.getState().selectSection(null)}
          >
            {ui.document}
          </button>
        ) : null}
      </header>
      <ScrollArea className="min-h-0 flex-1">
        <div className="grid gap-6 px-4 py-4">
          {selectedSectionId ? (
            <SectionDesign sectionId={selectedSectionId} />
          ) : (
            <DocumentDesign />
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}

function DocumentDesign() {
  const config = useEditorStore((state) => state.config);
  const source = useEditorStore((state) => state.source);
  const patchConfig = useEditorStore((state) => state.patchConfig);
  const compiled = compileResume({ source, config });
  const { style } = compiled;
  const ui = useUi();
  const labels = resolveLocale(useUiLocale()).labels;

  return (
    <>
      <PanelBlock title={ui.theme}>
        <Segmented
          value={style.themeId}
          onChange={(theme) => patchConfig({ theme })}
          options={[
            { value: "minimal", label: ui.themes.minimal },
            { value: "modern", label: ui.themes.modern },
            { value: "classic", label: ui.themes.classic },
          ]}
        />
      </PanelBlock>

      <PanelBlock title={ui.typography}>
        <Field label={ui.latin}>
          <Select
            value={style.fonts.latin}
            onValueChange={(latin) => latin && patchConfig({ fonts: { latin } })}
          >
            <SelectTrigger className="w-full" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LATIN_FONTS.map((font) => (
                <SelectItem key={font} value={font}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label={ui.cjk}>
          <Select
            value={style.fonts.cjk}
            onValueChange={(cjk) => cjk && patchConfig({ fonts: { cjk } })}
          >
            <SelectTrigger className="w-full" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CJK_FONTS.map((font) => (
                <SelectItem key={font} value={font}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label={ui.name} hint={`${style.typography.name.fontSize} pt`}>
          <NumberSlider
            value={style.typography.name.fontSize}
            min={14}
            max={28}
            step={0.5}
            onChange={(fontSize) => patchConfig({ typography: { name: { fontSize } } })}
          />
        </Field>
        <Field label={ui.sectionTitle} hint={`${style.typography.sectionTitle.fontSize} pt`}>
          <NumberSlider
            value={style.typography.sectionTitle.fontSize}
            min={9}
            max={16}
            step={0.5}
            onChange={(fontSize) =>
              patchConfig({ typography: { sectionTitle: { fontSize } } })
            }
          />
        </Field>
        <Field label={ui.body} hint={`${style.typography.body.fontSize} pt`}>
          <NumberSlider
            value={style.typography.body.fontSize}
            min={8}
            max={13}
            step={0.5}
            onChange={(fontSize) =>
              patchConfig({ typography: { base: { fontSize }, body: { fontSize } } })
            }
          />
        </Field>
        <Field label={ui.lineHeight} hint={style.typography.body.lineHeight.toFixed(2)}>
          <NumberSlider
            value={style.typography.body.lineHeight}
            min={1.15}
            max={1.8}
            step={0.05}
            onChange={(lineHeight) =>
              patchConfig({
                typography: { base: { lineHeight }, body: { lineHeight } },
              })
            }
          />
        </Field>
      </PanelBlock>

      <PanelBlock title={ui.spacing}>
        <Segmented<SpacingPreset>
          value={config.spacingPreset ?? "normal"}
          onChange={(spacingPreset) => {
            useEditorStore.getState().resetConfigPath(["spacing"]);
            patchConfig({ spacingPreset });
          }}
          options={[
            { value: "compact", label: ui.spacingPresets.compact },
            { value: "normal", label: ui.spacingPresets.normal },
            { value: "relaxed", label: ui.spacingPresets.relaxed },
          ]}
        />
        <Field label={ui.sectionGap} hint={`${style.spacing.sectionGap} mm`}>
          <NumberSlider
            value={style.spacing.sectionGap}
            min={3}
            max={12}
            step={0.5}
            onChange={(sectionGap) => patchConfig({ spacing: { sectionGap } })}
          />
        </Field>
        <Field label={ui.itemGap} hint={`${style.spacing.itemGap} mm`}>
          <NumberSlider
            value={style.spacing.itemGap}
            min={1.5}
            max={8}
            step={0.5}
            onChange={(itemGap) => patchConfig({ spacing: { itemGap } })}
          />
        </Field>
      </PanelBlock>

      <PanelBlock title={ui.layout}>
        <Field label={labels.experience}>
          <Segmented<ExperienceLayout>
            value={style.layout.experience}
            onChange={(experience) => patchConfig({ layout: { experience } })}
            options={[
              { value: "default", label: ui.experienceLayouts.default },
              { value: "compact", label: ui.experienceLayouts.compact },
              { value: "stacked", label: ui.experienceLayouts.stacked },
            ]}
          />
        </Field>
        <Field label={labels.projects}>
          <Segmented<ProjectLayout>
            value={style.layout.projects}
            onChange={(projects) => patchConfig({ layout: { projects } })}
            options={[
              { value: "default", label: ui.projectLayouts.default },
              { value: "compact", label: ui.projectLayouts.compact },
            ]}
          />
        </Field>
        <Field label={labels.skills}>
          <Segmented<SkillsLayout>
            value={style.layout.skills}
            onChange={(skills) => patchConfig({ layout: { skills } })}
            options={[
              { value: "inline", label: ui.skillsLayouts.inline },
              { value: "stacked", label: ui.skillsLayouts.stacked },
              { value: "columns", label: ui.skillsLayouts.columns },
            ]}
          />
        </Field>
        <Field label={labels.education}>
          <Segmented<EducationLayout>
            value={style.layout.education}
            onChange={(education) => patchConfig({ layout: { education } })}
            options={[
              { value: "default", label: ui.educationLayouts.default },
              { value: "compact", label: ui.educationLayouts.compact },
            ]}
          />
        </Field>
      </PanelBlock>

      <PanelBlock title={ui.icons}>
        <Segmented<IconMode>
          value={style.icons.mode}
          onChange={(mode) => patchConfig({ icons: { mode } })}
          options={[
            { value: "none", label: ui.iconModes.none },
            { value: "section", label: ui.iconModes.section },
            { value: "full", label: ui.iconModes.full },
          ]}
        />
        <Field label={ui.iconSize} hint={`${style.icons.size} pt`}>
          <NumberSlider
            value={style.icons.size}
            min={8}
            max={16}
            step={0.5}
            onChange={(size) => patchConfig({ icons: { size } })}
          />
        </Field>
      </PanelBlock>

      <PanelBlock title={ui.page}>
        <Field label={ui.marginY} hint={`${style.page.margin.top} mm`}>
          <NumberSlider
            value={style.page.margin.top}
            min={8}
            max={24}
            step={0.5}
            onChange={(value) => patchConfig({ page: { margin: { top: value, bottom: value } } })}
          />
        </Field>
        <Field label={ui.marginX} hint={`${style.page.margin.left} mm`}>
          <NumberSlider
            value={style.page.margin.left}
            min={8}
            max={24}
            step={0.5}
            onChange={(value) => patchConfig({ page: { margin: { left: value, right: value } } })}
          />
        </Field>
      </PanelBlock>
    </>
  );
}

function SectionDesign({ sectionId }: { sectionId: SectionId }) {
  const config = useEditorStore((state) => state.config);
  const source = useEditorStore((state) => state.source);
  const patchConfig = useEditorStore((state) => state.patchConfig);
  const resetConfigPath = useEditorStore((state) => state.resetConfigPath);
  const compiled = compileResume({ source, config });
  const sectionStyle = compiled.style.sections[sectionId];
  const overridden = hasPath(config, ["sections", sectionId]);
  const ui = useUi();

  const patchSection = (patch: SectionOverride) => {
    patchConfig({
      sections: {
        [sectionId]: patch,
      },
    });
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground/80">{ui.inheritHint}</p>
        <Button
          variant="ghost"
          size="xs"
          disabled={!overridden}
          onClick={() => resetConfigPath(["sections", sectionId])}
        >
          {ui.reset}
        </Button>
      </div>
      <Separator />

      {sectionId === "experience" ? (
        <PanelBlock title={ui.layout}>
          <Segmented<ExperienceLayout>
            value={(sectionStyle.layout as ExperienceLayout) ?? "default"}
            onChange={(layout) => patchSection({ layout })}
            options={[
              { value: "default", label: ui.experienceLayouts.default },
              { value: "compact", label: ui.experienceLayouts.compact },
              { value: "stacked", label: ui.experienceLayouts.stacked },
            ]}
          />
        </PanelBlock>
      ) : null}
      {sectionId === "projects" ? (
        <PanelBlock title={ui.layout}>
          <Segmented<ProjectLayout>
            value={(sectionStyle.layout as ProjectLayout) ?? "default"}
            onChange={(layout) => patchSection({ layout })}
            options={[
              { value: "default", label: ui.projectLayouts.default },
              { value: "compact", label: ui.projectLayouts.compact },
            ]}
          />
        </PanelBlock>
      ) : null}
      {sectionId === "skills" ? (
        <PanelBlock title={ui.layout}>
          <Segmented<SkillsLayout>
            value={(sectionStyle.layout as SkillsLayout) ?? "inline"}
            onChange={(layout) => patchSection({ layout })}
            options={[
              { value: "inline", label: ui.skillsLayouts.inline },
              { value: "stacked", label: ui.skillsLayouts.stacked },
              { value: "columns", label: ui.skillsLayouts.columns },
            ]}
          />
        </PanelBlock>
      ) : null}
      {sectionId === "education" ? (
        <PanelBlock title={ui.layout}>
          <Segmented<EducationLayout>
            value={(sectionStyle.layout as EducationLayout) ?? "default"}
            onChange={(layout) => patchSection({ layout })}
            options={[
              { value: "default", label: ui.educationLayouts.default },
              { value: "compact", label: ui.educationLayouts.compact },
            ]}
          />
        </PanelBlock>
      ) : null}

      <PanelBlock title={ui.typography}>
        <Field label={ui.title} hint={`${sectionStyle.typography.sectionTitle.fontSize} pt`}>
          <NumberSlider
            value={sectionStyle.typography.sectionTitle.fontSize}
            min={9}
            max={16}
            step={0.5}
            onChange={(fontSize) => patchSection({ typography: { sectionTitle: { fontSize } } })}
          />
        </Field>
        <Field label={ui.body} hint={`${sectionStyle.typography.body.fontSize} pt`}>
          <NumberSlider
            value={sectionStyle.typography.body.fontSize}
            min={8}
            max={13}
            step={0.5}
            onChange={(fontSize) => patchSection({ typography: { body: { fontSize } } })}
          />
        </Field>
        <Field label={ui.meta} hint={`${sectionStyle.typography.meta.fontSize} pt`}>
          <NumberSlider
            value={sectionStyle.typography.meta.fontSize}
            min={7}
            max={12}
            step={0.5}
            onChange={(fontSize) => patchSection({ typography: { meta: { fontSize } } })}
          />
        </Field>
      </PanelBlock>

      <PanelBlock title={ui.spacing}>
        <Field label={ui.itemGap} hint={`${sectionStyle.spacing.itemGap} mm`}>
          <NumberSlider
            value={sectionStyle.spacing.itemGap}
            min={1.5}
            max={8}
            step={0.5}
            onChange={(itemGap) => patchSection({ spacing: { itemGap } })}
          />
        </Field>
      </PanelBlock>

      <PanelBlock title={ui.icon}>
        <IconPicker
          sectionId={sectionId}
          value={sectionStyle.icon}
          onChange={(icon) => patchSection({ icon })}
        />
      </PanelBlock>
    </>
  );
}
