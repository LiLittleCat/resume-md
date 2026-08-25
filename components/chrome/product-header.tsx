import type { ReactNode } from "react";
import type { UiCopy } from "@/locales/ui";
import { HelpDialog } from "@/components/editor/help-dialog";
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
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-3">
        <ProductMark href={href} title={title} size="large" />
        <div aria-hidden="true" className="h-4 w-px bg-border" />
        <HelpDialog ui={ui} />
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </header>
  );
}
