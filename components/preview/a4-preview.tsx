"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { compileResume } from "@/core/compile";
import { collectPageOffsets, sameOffsets } from "@/core/layout";
import type { SectionId } from "@/core/schema";
import { ResumeDocument } from "@/components/resume";
import { useUi } from "@/components/editor/use-ui";
import { useEditorStore } from "@/store/editor-store";

export function A4Preview() {
  const source = useEditorStore((state) => state.source);
  const config = useEditorStore((state) => state.config);
  const selectedSectionId = useEditorStore((state) => state.selectedSectionId);
  const selectedSectionTitle = useEditorStore((state) => state.selectedSectionTitle);
  const previewScale = useEditorStore((state) => state.previewScale);
  const selectSection = useEditorStore((state) => state.selectSection);
  const ui = useUi();

  const compiled = useMemo(() => {
    try {
      return compileResume({ source, config });
    } catch {
      return null;
    }
  }, [source, config]);

  const measureRef = useRef<HTMLDivElement>(null);
  const offsetsRef = useRef<number[]>([0]);
  const [offsets, setOffsets] = useState<number[]>([0]);
  const [pageHeightPx, setPageHeightPx] = useState(1);
  const pageCount = offsets.length;

  const style = compiled?.style;
  const innerHeightMm = style
    ? style.page.heightMm - style.page.margin.top - style.page.margin.bottom
    : 269;
  const innerWidthMm = style
    ? style.page.widthMm - style.page.margin.left - style.page.margin.right
    : 178;

  useEffect(() => {
    const node = measureRef.current;
    if (!node || !compiled) return;

    let cancelled = false;
    const measure = () => {
      if (cancelled) return;
      const boxes = [...node.querySelectorAll<HTMLElement>("[data-box]")].map((el, index) => {
        const styles = window.getComputedStyle(el);
        const marginTop = Number.parseFloat(styles.marginTop) || 0;
        const marginBottom = Number.parseFloat(styles.marginBottom) || 0;
        return {
          id: String(index),
          height: el.offsetHeight + marginTop + marginBottom,
          top: el.offsetTop,
          keepTogether: el.dataset.keepTogether === "true",
          keepWithNext: el.dataset.keepWithNext === "true",
        };
      });

      const mmInPx = innerWidthMm > 0 ? node.clientWidth / innerWidthMm : 0;
      const pageHeightPx = innerHeightMm * mmInPx;
      const nextOffsets = collectPageOffsets({
        boxes,
        contentHeight: node.scrollHeight,
        pageHeight: pageHeightPx,
      });
      setPageHeightPx(pageHeightPx);
      if (sameOffsets(offsetsRef.current, nextOffsets)) return;
      offsetsRef.current = nextOffsets;
      setOffsets(nextOffsets);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    for (const image of node.querySelectorAll("img")) {
      if (!image.complete) image.addEventListener("load", measure, { once: true });
    }
    void document.fonts.ready.then(measure);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [compiled, innerHeightMm, innerWidthMm]);

  if (!compiled || !style) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        {ui.compileError}
      </div>
    );
  }

  const { resume, locale } = compiled;
  const pageWidth = style.page.widthMm;
  const pageHeight = style.page.heightMm;

  const documentProps = {
    resume,
    style,
    locale,
    padded: false as const,
    selectedSectionId,
    selectedSectionTitle,
    onSelectSection: (id: SectionId | null, title?: string | null) => selectSection(id, title),
  };

  return (
    <div
      className="relative flex min-h-full flex-col items-center gap-8 py-8"
      onClick={() => selectSection(null)}
    >
      <div
        ref={measureRef}
        aria-hidden
        className="pointer-events-none absolute top-0 left-[-220vw] opacity-0"
        style={{ width: `${innerWidthMm}mm` }}
      >
        <ResumeDocument {...documentProps} />
      </div>

      {Array.from({ length: pageCount }, (_, index) => {
        const start = offsets[index] ?? 0;
        const next = offsets[index + 1];
        const clipPx =
          next === undefined ? pageHeightPx : Math.max(0, Math.min(pageHeightPx, next - start));
        return (
        <div
          key={index}
          style={{
            width: `${pageWidth * previewScale}mm`,
            height: `${pageHeight * previewScale}mm`,
          }}
        >
          <div
            className="resume-paper"
            style={{
              width: `${pageWidth}mm`,
              height: `${pageHeight}mm`,
              padding: `${style.page.margin.top}mm ${style.page.margin.right}mm ${style.page.margin.bottom}mm ${style.page.margin.left}mm`,
              background: style.colors.background,
              transform: `scale(${previewScale})`,
              transformOrigin: "top left",
            }}
          >
            <div
              className="relative overflow-hidden"
              style={{ width: `${innerWidthMm}mm`, height: `${clipPx}px` }}
            >
              <div style={{ transform: `translateY(-${start}px)` }}>
                <ResumeDocument {...documentProps} />
              </div>
            </div>
          </div>
        </div>
        );
      })}
    </div>
  );
}
