"use client";

import { useRef, useState, type FormEvent } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { LocaleId } from "@/core/schema";
import { compileResume } from "@/core/compile";
import { parseResumeMarkdown } from "@/core/parser";
import { documentFontFamilies } from "@/core/renderer";
import { HeaderControls } from "@/components/chrome/header-controls";
import { ProductHeader } from "@/components/chrome/product-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEditorStore } from "@/store/editor-store";
import { materializeAvatarSource } from "@/lib/avatar-assets";
import { defaultExportBasename, sanitizeExportBasename } from "@/lib/export-filename";
import { printResume } from "@/lib/print-export";
import { useColorScheme } from "./use-color-scheme";
import { useUi, useUiLocale } from "./use-ui";

export function EditorToolbar() {
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filename, setFilename] = useState("");
  const lastFilenameRef = useRef<string | null>(null);
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

  const suggestedFilename = () =>
    defaultExportBasename(parseResumeMarkdown(source).resume.profile.name);

  const openExportDialog = () => {
    setFilename(lastFilenameRef.current ?? suggestedFilename());
    setExportOpen(true);
  };

  const closeExportDialog = (open: boolean) => {
    if (exporting) return;
    setExportOpen(open);
  };

  const exportPdf = async (basename: string) => {
    const nextBasename = sanitizeExportBasename(basename);
    setExporting(true);
    try {
      const exportSource = materializeAvatarSource(source, window.localStorage);
      if (!exportSource) throw new Error(ui.avatarMissing);
      const { style } = compileResume({ source: exportSource, config });
      lastFilenameRef.current = nextBasename;
      setExportOpen(false);
      // Let the dialog close before the browser's print dialog takes over.
      await new Promise((resolve) => window.setTimeout(resolve, 0));
      await printResume({
        source: exportSource,
        config,
        title: nextBasename,
        fontFamilies: documentFontFamilies(style.fonts),
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : ui.pdfFailed);
    } finally {
      setExporting(false);
    }
  };

  const confirmExport = () => {
    if (!filename.trim() || exporting) return;
    void exportPdf(filename);
  };

  const onExportFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    confirmExport();
  };

  return (
    <>
      <ProductHeader href="/resumes" title={ui.back} ui={ui}>
        <HeaderControls
          locale={uiLocale}
          colorScheme={preference}
          ui={ui}
          onLocaleChange={switchLocale}
          onColorSchemeChange={setColorScheme}
        />
        <div aria-hidden="true" className="mx-1 h-4 w-px bg-border" />
        <Button
          size="sm"
          onClick={openExportDialog}
          disabled={exporting}
          className="bg-primary text-primary-foreground hover:bg-primary/80 active:scale-[0.96]"
        >
          {exporting ? <Loader2 className="size-3.5 animate-spin" /> : <FileDown className="size-3.5" />}
          {ui.exportPdf}
        </Button>
      </ProductHeader>
      <Dialog open={exportOpen} onOpenChange={closeExportDialog}>
        <DialogContent>
          <form className="grid gap-4" onSubmit={onExportFormSubmit}>
            <DialogHeader>
              <DialogTitle>{ui.exportPdf}</DialogTitle>
              <DialogDescription>{ui.exportFilenameHint}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-1.5">
              <Label htmlFor="export-filename">{ui.exportFilename}</Label>
              <div className="flex min-w-0 items-center gap-1.5">
                <Input
                  id="export-filename"
                  value={filename}
                  autoComplete="off"
                  spellCheck={false}
                  disabled={exporting}
                  onChange={(event) => setFilename(event.currentTarget.value)}
                  onFocus={(event) => event.currentTarget.select()}
                />
                <span className="shrink-0 text-sm text-muted-foreground">.pdf</span>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" disabled={exporting} onClick={() => closeExportDialog(false)}>
                {ui.cancel}
              </Button>
              <Button type="button" disabled={exporting || !filename.trim()} onClick={confirmExport}>
                {exporting ? <Loader2 className="size-3.5 animate-spin" /> : <FileDown className="size-3.5" />}
                {ui.exportPdf}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
