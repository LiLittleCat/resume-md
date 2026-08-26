"use client"

import type { PartialOptions } from "overlayscrollbars"
import {
  OverlayScrollbarsComponent,
  type OverlayScrollbarsComponentProps,
} from "overlayscrollbars-react"

import { cn } from "@/lib/utils"

function ScrollArea({
  className,
  children,
  defer = true,
  options,
  ...props
}: OverlayScrollbarsComponentProps & { options?: PartialOptions }) {
  return (
    <OverlayScrollbarsComponent
      data-slot="scroll-area"
      className={cn("relative", className)}
      defer={defer}
      options={{
        ...options,
        overflow: { x: "hidden", y: "scroll", ...options?.overflow },
        scrollbars: {
          autoHide: "move",
          autoHideDelay: 500,
          theme: "os-theme-resume",
          ...options?.scrollbars,
        },
      }}
      {...props}
    >
      {children}
    </OverlayScrollbarsComponent>
  )
}

export { ScrollArea }
