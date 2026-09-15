import type { ReactNode } from "react";
import type { UiCopy } from "@/locales/ui";
import { HelpDialog } from "@/components/editor/help-dialog";
import { AgentDialog } from "@/components/editor/agent-dialog";
import { ProductMark } from "./product-mark";

export function ProductHeader({
  href,
  title,
  ui,
  children,
}: {
  href: string;
  title?: string;
  ui: UiCopy;
  children: ReactNode;
}) {
  return (
    <header className="flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-border bg-background px-4 py-2">
      <div className="flex items-center gap-2">
        <ProductMark href={href} title={title} size="large" />
        <div aria-hidden="true" className="h-4 w-px bg-border" />
        <HelpDialog ui={ui} />
        <AgentDialog ui={ui} />
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </header>
  );
}
