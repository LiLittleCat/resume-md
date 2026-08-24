"use client";

import { useEffect, useSyncExternalStore } from "react";
import { compileResume } from "@/core/compile";
import type { ResumeConfig } from "@/core/schema";
import { ResumeDocument } from "@/components/resume";
import { getUiCopy } from "@/locales/ui";

interface PrintPayload {
  source: string;
  config?: ResumeConfig;
}

const emptySubscribe = () => () => undefined;

let cachedRaw: string | null | undefined;
let cachedPayload: PrintPayload | null = null;

function readPayload(): PrintPayload | null {
  const raw = sessionStorage.getItem("resume-md:print");
  if (raw === cachedRaw) return cachedPayload;
  cachedRaw = raw;
  if (!raw) {
    cachedPayload = null;
    return null;
  }
  try {
    cachedPayload = JSON.parse(raw) as PrintPayload;
  } catch {
    cachedPayload = null;
  }
  return cachedPayload;
}

export function PrintResume() {
  const payload = useSyncExternalStore(emptySubscribe, readPayload, () => null);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
  }, []);

  if (!payload?.source) {
    return <p className="p-8 text-sm">{getUiCopy(undefined).printEmpty}</p>;
  }

  const compiled = compileResume({ source: payload.source, config: payload.config ?? {} });
  const { resume, style, locale } = compiled;
  const margin = style.page.margin;

  return (
    <>
      <style>{`
        @page {
          size: ${style.page.size};
          margin: ${margin.top}mm ${margin.right}mm ${margin.bottom}mm ${margin.left}mm;
        }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: ${style.colors.background} !important;
          color-scheme: light !important;
        }
        nextjs-portal,
        [data-nextjs-toast],
        [data-next-badge-root],
        .toaster {
          display: none !important;
        }
        .resume-root {
          width: auto !important;
          max-width: none !important;
          background: ${style.colors.background} !important;
        }
      `}</style>
      <ResumeDocument resume={resume} style={style} locale={locale} padded={false} />
    </>
  );
}
