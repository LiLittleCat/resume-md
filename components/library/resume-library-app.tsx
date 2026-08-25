"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Copy, Plus, Trash2 } from "lucide-react";
import type { LocaleId, ResumeConfig } from "@/core/schema";
import { HeaderControls } from "@/components/chrome/header-controls";
import { ProductHeader } from "@/components/chrome/product-header";
import { useAppliedColorScheme } from "@/components/chrome/use-applied-color-scheme";
import { persistLibraryOrToast } from "@/components/library/persist";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRelativeTime } from "@/lib/relative-time";
import {
  createResumeDocument,
  deleteResumeDocument,
  duplicateResumeDocument,
  hydrateResumeLibrary,
  listResumeDocuments,
  resumeDocumentName,
  resumeDocumentRole,
  resumeDocumentTheme,
  setActiveResume,
  updateResumeChrome,
  updateResumeDocument,
  type ResumeLibrary,
} from "@/lib/resume-storage";
import { getUiCopy, resolveUiLocale, type UiCopy } from "@/locales/ui";

export function ResumeLibraryApp({
  examples,
  defaultConfig,
}: {
  examples: Record<LocaleId, string>;
  defaultConfig: ResumeConfig;
}) {
  const router = useRouter();
  const isClient = useSyncExternalStore(emptySubscribe, clientSnapshot, serverSnapshot);
  const [library, setLibrary] = useState<ResumeLibrary | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [emptyLocale, setEmptyLocale] = useState<LocaleId>("zh-CN");

  if (isClient && library === null) {
    setLibrary(
      hydrateResumeLibrary(window.localStorage, {
        source: examples["zh-CN"],
        config: defaultConfig,
      }),
    );
  }

  const locale = library ? libraryLocale(library, emptyLocale) : emptyLocale;
  const colorScheme = library?.chrome.colorScheme ?? "system";
  useAppliedColorScheme(colorScheme);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dataset.uiLocale = locale;
  }, [locale]);

  if (!library) {
    return <div className="h-screen bg-background" />;
  }

  const ui = getUiCopy(locale);
  const documents = listResumeDocuments(library);

  const commit = (next: ResumeLibrary) => {
    persistLibraryOrToast(next, locale);
    setLibrary(next);
  };

  const openResume = (id: string) => {
    commit(setActiveResume(library, id));
    router.push("/");
  };

  const createFrom = (nextLocale: LocaleId) => {
    const { library: next } = createResumeDocument(library, {
      source: examples[nextLocale],
      config: { ...defaultConfig, locale: nextLocale },
    });
    persistLibraryOrToast(next, nextLocale);
    setLibrary(next);
    router.push("/");
  };

  const duplicate = (id: string) => {
    const duplicated = duplicateResumeDocument(library, id);
    if (duplicated) commit(duplicated.library);
  };

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    commit(deleteResumeDocument(library, pendingDeleteId));
    setPendingDeleteId(null);
  };

  const switchLocale = (nextLocale: LocaleId) => {
    const activeId = library.activeId ?? listResumeDocuments(library)[0]?.id;
    const active = activeId ? library.documents[activeId] : undefined;
    if (!activeId || !active) {
      setEmptyLocale(nextLocale);
      return;
    }
    commit(
      updateResumeDocument(library, activeId, {
        config: { ...active.config, locale: nextLocale },
      }),
    );
  };

  const setColorScheme = (nextColorScheme: typeof colorScheme) => {
    commit(updateResumeChrome(library, { colorScheme: nextColorScheme }));
  };

  return (
    <div
      data-ui-locale={locale}
      lang={locale}
      className="flex min-h-screen flex-col bg-background text-foreground"
    >
      <ProductHeader href="/" ui={ui}>
        <HeaderControls
          locale={locale}
          colorScheme={colorScheme}
          ui={ui}
          onLocaleChange={switchLocale}
          onColorSchemeChange={setColorScheme}
        />
        <div aria-hidden="true" className="mx-1 h-4 w-px bg-border" />
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button size="sm" />}>
            <Plus className="size-3.5" />
            {ui.newResume}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-40">
            <DropdownMenuItem onClick={() => createFrom("zh-CN")}>{ui.newFromZh}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => createFrom("en-US")}>{ui.newFromEn}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ProductHeader>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8">
        {documents.length === 0 ? (
          <EmptyState ui={ui} onCreateZh={() => createFrom("zh-CN")} onCreateEn={() => createFrom("en-US")} />
        ) : (
          <ul className="overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10">
            {documents.map((document) => {
              const name = resumeDocumentName(document.source, ui.unnamedResume);
              const role = resumeDocumentRole(document.source);
              const theme = ui.themes[resumeDocumentTheme(document.config)];
              const documentLocale = resolveUiLocale(document.config.locale);
              const localeLabel = documentLocale === "en-US" ? ui.localeEn : ui.localeZh;
              const active = document.id === library.activeId;
              return (
                <li key={document.id} className="border-b border-border last:border-b-0">
                  <div className="flex items-stretch">
                    <button
                      type="button"
                      onClick={() => openResume(document.id)}
                      className="flex min-w-0 flex-1 flex-col gap-1 px-4 py-3.5 text-left transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none"
                    >
                      <div className="flex items-baseline gap-2">
                        <span className="truncate text-[15px] font-medium tracking-[-0.02em]">
                          {name}
                        </span>
                        {active ? (
                          <span className="ui-kicker shrink-0 text-primary">{ui.editingNow}</span>
                        ) : null}
                      </div>
                      {role ? (
                        <p className="truncate text-sm text-muted-foreground">{role}</p>
                      ) : null}
                      <p className="text-[12px] text-muted-foreground/80">
                        {localeLabel}
                        <span className="mx-1.5 text-border">·</span>
                        {theme}
                        <span className="mx-1.5 text-border">·</span>
                        {formatRelativeTime(document.updatedAt, locale)}
                      </p>
                    </button>
                    <div className="flex items-center gap-0.5 pr-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label={ui.duplicateResume}
                        onClick={() => duplicate(document.id)}
                      >
                        <Copy className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label={ui.deleteResume}
                        onClick={() => setPendingDeleteId(document.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <Dialog open={pendingDeleteId !== null} onOpenChange={(open) => !open && setPendingDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ui.deleteResumeTitle}</DialogTitle>
            <DialogDescription>{ui.deleteResumeConfirm}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPendingDeleteId(null)}>
              {ui.cancel}
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDelete}>
              {ui.deleteResume}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyState({
  ui,
  onCreateZh,
  onCreateEn,
}: {
  ui: UiCopy;
  onCreateZh: () => void;
  onCreateEn: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-4 px-1">
      <div className="space-y-1.5">
        <h1 className="text-lg font-medium tracking-[-0.02em]">{ui.resumesEmpty}</h1>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{ui.resumesEmptyHint}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={onCreateZh}>
          <Plus className="size-3.5" />
          {ui.newFromZh}
        </Button>
        <Button size="sm" variant="outline" onClick={onCreateEn}>
          {ui.newFromEn}
        </Button>
      </div>
    </div>
  );
}

const emptySubscribe = () => () => undefined;
const clientSnapshot = () => true;
const serverSnapshot = () => false;

function libraryLocale(library: ResumeLibrary, fallback: LocaleId): LocaleId {
  const active = library.activeId ? library.documents[library.activeId] : undefined;
  if (active) return resolveUiLocale(active.config.locale);
  const newest = listResumeDocuments(library)[0];
  return newest ? resolveUiLocale(newest.config.locale) : fallback;
}
