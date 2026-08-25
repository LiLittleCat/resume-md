"use client";

import { useState } from "react";
import { FileDown, Loader2, Monitor, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { compileResume } from "@/core/compile";
import type { LocaleId } from "@/core/schema";
import { ProductMark } from "@/components/chrome/product-mark";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store/editor-store";
import { IconToggle, IconToggleGroup } from "./icon-toggle";
import { useColorScheme } from "./use-color-scheme";
import { useUi, useUiLocale } from "./use-ui";

export function EditorToolbar() {
  const [exporting, setExporting] = useState(false);
  const source = useEditorStore((state) => state.source);
  const config = useEditorStore((state) => state.config);
  const patchConfig = useEditorStore((state) => state.patchConfig);
  const uiLocale = useUiLocale();
  const ui = useUi();
  const { preference, setColorScheme } = useColorScheme();

  const switchLocale = (locale: LocaleId) => {
    if (locale === uiLocale) return;
    patchConfig({ locale });
  };

  const exportPdf = async () => {
    setExporting(true);
    try {
      const compiled = compileResume({ source, config });
      const response = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, config }),
      });
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || ui.pdfFailed);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const filename = (compiled.resume.profile.name || "resume").replace(/\s+/g, "-");
      link.href = url;
      link.download = `${filename}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(ui.pdfExported);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : ui.pdfFailed);
    } finally {
      setExporting(false);
    }
  };

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-3">
        <ProductMark href="/resumes" title={ui.back} />
        <div className="h-4 w-px bg-border" />
        <IconToggleGroup>
          <IconToggle
            pressed={uiLocale === "zh-CN"}
            label={ui.localeZh}
            onPressed={() => switchLocale("zh-CN")}
          >
            中
          </IconToggle>
          <IconToggle
            pressed={uiLocale === "en-US"}
            label={ui.localeEn}
            onPressed={() => switchLocale("en-US")}
          >
            EN
          </IconToggle>
        </IconToggleGroup>
        <IconToggleGroup>
          <IconToggle
            pressed={preference === "light"}
            label={ui.schemeLight}
            onPressed={() => setColorScheme("light")}
          >
            <Sun className="size-3.5" />
          </IconToggle>
          <IconToggle
            pressed={preference === "dark"}
            label={ui.schemeDark}
            onPressed={() => setColorScheme("dark")}
          >
            <Moon className="size-3.5" />
          </IconToggle>
          <IconToggle
            pressed={preference === "system"}
            label={ui.schemeSystem}
            onPressed={() => setColorScheme("system")}
          >
            <Monitor className="size-3.5" />
          </IconToggle>
        </IconToggleGroup>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={exportPdf}
          disabled={exporting}
          className="bg-primary text-primary-foreground hover:bg-primary/80 active:scale-[0.96]"
        >
          {exporting ? <Loader2 className="size-3.5 animate-spin" /> : <FileDown className="size-3.5" />}
          {ui.exportPdf}
        </Button>
      </div>
    </header>
  );
}
