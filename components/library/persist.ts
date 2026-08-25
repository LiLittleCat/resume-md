"use client";

import { toast } from "sonner";
import { getUiCopy } from "@/locales/ui";
import { persistResumeLibrary, type ResumeLibrary } from "@/lib/resume-storage";

export function persistLibraryOrToast(
  library: ResumeLibrary,
  locale?: string | null,
): boolean {
  const result = persistResumeLibrary(window.localStorage, library);
  if (!result.ok) {
    toast.error(getUiCopy(locale).storageFull);
    return false;
  }
  return true;
}
