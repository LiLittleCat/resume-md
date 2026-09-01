"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import { CONTACT_FIELDS, type Contact, type ContactField, type ResumeIcon } from "@/core/schema";
import { ResumeGlyph } from "./resume-icon";

const FIELD_HREF: Partial<Record<ContactField, (value: string) => string>> = {
  email: (value) => `mailto:${value}`,
  phone: (value) => `tel:${value.replace(/[^\d+]/g, "")}`,
  github: identity,
  linkedin: identity,
  website: identity,
};

function identity(value: string): string {
  return value;
}

export function displayContactValue(field: ContactField, value: string): string {
  if (field === "github" || field === "linkedin" || field === "website") {
    return value.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
  return value;
}

export function ContactLine({
  contact,
  separator,
  showIcons,
  icons,
}: {
  contact: Contact;
  separator: string;
  showIcons: boolean;
  icons: Record<ContactField, ResumeIcon>;
}) {
  const items = CONTACT_FIELDS.filter((field) => contact[field]);
  const lineRef = useRef<HTMLDivElement>(null);
  useContactLineStarts(lineRef, items.length, separator);
  if (items.length === 0) return null;

  return (
    <div ref={lineRef} className="resume-contact">
      <span className="resume-contact-sep-measure" aria-hidden>
        {separator}
      </span>
      {items.map((field, index) => {
        const value = contact[field];
        if (!value) return null;
        const href = FIELD_HREF[field]?.(value);
        const content = (
          <>
            {showIcons ? <ResumeGlyph icon={icons[field]} /> : null}
            <span>{displayContactValue(field, value)}</span>
          </>
        );
        return (
          <span key={field} className="resume-contact-cluster">
            {index > 0 ? <span className="resume-contact-sep">{separator}</span> : null}
            {href ? (
              <a className="resume-contact-item" href={href}>
                {content}
              </a>
            ) : (
              <span className="resume-contact-item">{content}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}

function useContactLineStarts(
  lineRef: RefObject<HTMLDivElement | null>,
  itemCount: number,
  separator: string,
) {
  useLayoutEffect(() => {
    const line = lineRef.current;
    if (!line) return;

    const update = () => {
      const clusters = [...line.querySelectorAll<HTMLElement>(".resume-contact-cluster")];
      const itemWidths = clusters.map(
        (cluster) =>
          cluster.querySelector<HTMLElement>(".resume-contact-item")?.getBoundingClientRect().width ??
          0,
      );
      const separatorWidth =
        line.querySelector<HTMLElement>(".resume-contact-sep-measure")?.getBoundingClientRect()
          .width ?? 0;
      const lineStyle = window.getComputedStyle(line);
      const clusterStyle = clusters[0] ? window.getComputedStyle(clusters[0]) : undefined;
      const starts = contactLineStarts({
        containerWidth: line.clientWidth,
        itemWidths,
        separatorWidth,
        outerGap: Number.parseFloat(lineStyle.columnGap) || 0,
        innerGap: Number.parseFloat(clusterStyle?.columnGap ?? "0") || 0,
      });
      const startSet = new Set(starts);
      clusters.forEach((cluster, index) => {
        cluster.dataset.lineStart = startSet.has(index) ? "true" : "false";
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(line);
    for (const item of line.querySelectorAll<HTMLElement>(".resume-contact-item")) {
      observer.observe(item);
    }
    void document.fonts.ready.then(update);
    return () => observer.disconnect();
  }, [itemCount, lineRef, separator]);
}

export function contactLineStarts({
  containerWidth,
  itemWidths,
  separatorWidth,
  outerGap,
  innerGap,
}: {
  containerWidth: number;
  itemWidths: number[];
  separatorWidth: number;
  outerGap: number;
  innerGap: number;
}): number[] {
  const starts: number[] = [];
  let rowWidth = 0;

  itemWidths.forEach((itemWidth, index) => {
    const regularWidth = separatorWidth + innerGap + itemWidth;
    const startsNewRow = index === 0 || rowWidth + outerGap + regularWidth > containerWidth + 0.5;
    if (startsNewRow) {
      starts.push(index);
      rowWidth = itemWidth;
    } else {
      rowWidth += outerGap + regularWidth;
    }
  });

  return starts;
}
