"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ResumeGuideCopy } from "@/locales/resume-guide";

export function CopyTextButton({
  text,
  label,
  guide,
}: {
  text: string;
  label: string;
  guide: ResumeGuideCopy;
}) {
  const [status, setStatus] = useState<"idle" | "copying" | "copied" | "error">("idle");

  useEffect(() => {
    if (status !== "copied") return;
    const timer = window.setTimeout(() => setStatus("idle"), 2000);
    return () => window.clearTimeout(timer);
  }, [status]);

  async function copy() {
    setStatus("copying");
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" size="sm" onClick={copy} disabled={status === "copying"}>
        {status === "copied" ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        {status === "copying" ? guide.copying : status === "copied" ? guide.copied : label}
      </Button>
      <span role="status" className={status === "error" ? "text-xs text-destructive" : "sr-only"}>
        {status === "error" ? guide.copyFailed : status === "copied" ? guide.copied : ""}
      </span>
    </div>
  );
}
