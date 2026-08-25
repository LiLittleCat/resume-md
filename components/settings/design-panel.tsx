"use client";

import { useMemo } from "react";
import { PanelRightClose, RotateCcw } from "lucide-react";
import { compileResume } from "@/core/compile";
import { configWithTheme, hasDocumentDesignOverrides } from "@/core/style";
import { hasPath } from "@/core/style/merge";
import { resolveLocale } from "@/core/locale";
import type {
  IconMode,
  SectionId,
  SectionOverride,
  SpacingPreset,
  ThemeId,
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useEditorStore } from "@/store/editor-store";
import { AvatarField } from "./avatar-field";
import { Field, NumberSlider, PanelBlock, Segmented } from "./controls";
import { IconPicker } from "./icon-picker";

const LATIN_FONTS = ["Inter", "Source Serif 4"];
const CJK_FONTS = ["Noto Sans SC", "Noto Serif SC"];

export function DesignPanel({ onCollapse }: { onCollapse: () => void }) {
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
  const canReset = selectedSectionId
    ? hasPath(config, ["sections", selectedSectionId])
    : hasDocumentDesignOverrides(config);

  if (!compiled) {
    return <aside className="flex h-full items-center justify-center text-sm text-muted-foreground">{ui.noDocument}</aside>;
  }

  return (
    <aside className="flex h-full min-h-0 flex-col">
      <header className="flex h-11 items-center justify-between border-b border-border px-4">
        <p className="ui-kicker text-muted-foreground">
          {sectionTitle}
        </p>
        <div className="flex items-center gap-2">
          {selectedSectionId ? (
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => useEditorStore.getState().selectSection(null)}
            >
              {ui.document}
            </button>
          ) : null}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  disabled={!canReset}
                  aria-label={ui.reset}
                  onClick={() => {
                    const store = useEditorStore.getState();
                    if (selectedSectionId) store.resetConfigPath(["sections", selectedSectionId]);
                    else store.resetDocumentDesign();
                  }}
                >
                  <RotateCcw className="size-3.5" />
                </Button>
              }
            />
            <TooltipContent side="bottom">{ui.reset}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={ui.collapseDesign}
                  onClick={onCollapse}
                >
                  <PanelRightClose className="size-3.5" />
                </Button>
              }
            />
            <TooltipContent side="bottom">{ui.collapseDesign}</TooltipContent>
          </Tooltip>
        </div>
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

  return (
    <>
      <PanelBlock title={ui.theme}>
        <Segmented<ThemeId>
          value={style.themeId}
          onChange={(theme) =>
            useEditorStore.setState({ config: configWithTheme(config, theme) })
          }
          options={[
            { value: "minimal", label: ui.themes.minimal },
            { value: "modern", label: ui.themes.modern },
            { value: "classic", label: ui.themes.classic },
          ]}
        />
      </PanelBlock>

      <PanelBlock title={ui.avatar}>
        <AvatarField
          avatar={compiled.resume.profile.avatar}
          position={style.components.avatar.position}
          shape={style.components.avatar.shape}
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
  const compiled = compileResume({ source, config });
  const sectionStyle = compiled.style.sections[sectionId];
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
      <p className="text-sm text-foreground/80">{ui.inheritHint}</p>
      <Separator />

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
            onChange={(fontSize) =>
              patchSection({ typography: { base: { fontSize }, body: { fontSize } } })
            }
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
