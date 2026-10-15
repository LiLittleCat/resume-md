import {
  centeredPreviewScrollTop,
  isTargetFullyVisible,
  previewClickTarget,
  previewTargetTop,
  targetStartsInPage,
  type PreviewAnchor,
  type PreviewClickTarget,
} from "./outline";

export function previewClickTargetFromElement(target: EventTarget | null): PreviewClickTarget | null {
  if (!(target instanceof Element)) return null;
  const outline = target.closest<HTMLElement>("[data-outline-title]");
  const header = target.closest(".resume-header");
  const section =
    outline?.closest<HTMLElement>("[data-section-id]") ?? target.closest<HTMLElement>("[data-section-id]");
  return previewClickTarget({
    inHeader: Boolean(header),
    outlineTitle: outline?.dataset.outlineTitle,
    outlineDepth: outline?.dataset.outlineDepth,
    sectionId: section?.dataset.sectionId,
    sectionTitle: section?.dataset.sectionTitle,
  });
}

export function scrollToPreviewAnchor(
  scrollRoot: HTMLElement | null,
  entry: PreviewAnchor,
  ifVisible: "center" | "skip" = "center",
  options: { flash?: boolean } = {},
) {
  if (!scrollRoot) return;

  for (const candidate of previewCandidates(scrollRoot, entry)) {
    const located = locatePreviewTarget(candidate);
    if (!located) continue;
    if (options.flash) flashPreviewTarget(candidate, entry);

    const scrollRect = scrollRoot.getBoundingClientRect();
    if (
      ifVisible === "skip" &&
      isTargetFullyVisible({
        targetTop: located.targetTop,
        targetBottom: located.targetTop + located.targetHeight,
        viewportTop: scrollRect.top,
        viewportBottom: scrollRect.bottom,
      })
    ) {
      return;
    }

    scrollRoot.scrollTo({
      top: centeredPreviewScrollTop({
        currentScrollTop: scrollRoot.scrollTop,
        viewportTop: scrollRect.top,
        viewportHeight: scrollRoot.clientHeight,
        targetTop: located.targetTop,
        targetHeight: located.targetHeight,
      }),
      behavior: "smooth",
    });
    return;
  }

  if (entry.kind === "heading" && entry.depth === 2) {
    scrollToPreviewAnchor(
      scrollRoot,
      {
        kind: "heading",
        title: entry.sectionTitle,
        depth: 1,
        sectionTitle: entry.sectionTitle,
      },
      ifVisible,
      options,
    );
  }
}

const FLASH_ATTRIBUTE = "data-preview-flash";

/** Briefly highlights the located element so the eye can find it on the page. */
function flashPreviewTarget(candidate: HTMLElement, entry: PreviewAnchor) {
  // A whole section is too tall to read as a highlight; flash its title instead.
  const target =
    entry.kind === "heading" && entry.depth === 1
      ? (candidate.querySelector<HTMLElement>(".resume-section-title") ?? candidate)
      : candidate;
  const root = target.closest(".desk-canvas") ?? target.ownerDocument;
  for (const previous of root.querySelectorAll(`[${FLASH_ATTRIBUTE}]`)) {
    previous.removeAttribute(FLASH_ATTRIBUTE);
  }
  // Force a reflow so clicking the same spot again restarts the animation.
  void target.offsetWidth;
  target.setAttribute(FLASH_ATTRIBUTE, "true");
  target.addEventListener("animationend", () => target.removeAttribute(FLASH_ATTRIBUTE), {
    once: true,
  });
}

function locatePreviewTarget(candidate: HTMLElement): { targetTop: number; targetHeight: number } | null {
  const page = candidate.closest<HTMLElement>("[data-preview-page]");
  const pageViewport = page?.querySelector<HTMLElement>("[data-page-viewport]");
  const inner = pageViewport?.firstElementChild as HTMLElement | undefined;
  if (!page || !pageViewport || !inner) return null;

  const innerRect = inner.getBoundingClientRect();
  const viewRect = pageViewport.getBoundingClientRect();
  const targetRect = candidate.getBoundingClientRect();
  const scale = inner.offsetWidth > 0 ? innerRect.width / inner.offsetWidth : 1;
  if (scale === 0) return null;

  const relativeTop = (targetRect.top - innerRect.top) / scale;
  const pageStart = Number(page.dataset.pageOffset ?? "0");
  if (!targetStartsInPage(relativeTop, pageStart, pageStart + pageViewport.offsetHeight)) {
    return null;
  }

  return {
    targetTop: previewTargetTop({
      relativeTop,
      pageStart,
      viewportTop: viewRect.top,
      scale,
    }),
    targetHeight: targetRect.height,
  };
}

function previewCandidates(scrollRoot: HTMLElement, entry: PreviewAnchor): HTMLElement[] {
  if (entry.kind === "header") {
    return [...scrollRoot.querySelectorAll<HTMLElement>(".resume-paper .resume-header")];
  }

  const sectionSelector = `[data-section-title="${cssAttr(entry.sectionTitle)}"]`;
  const targetSelector = `[data-outline-title="${cssAttr(entry.title)}"][data-outline-depth="${entry.depth}"]`;
  const selector =
    entry.depth === 1
      ? `.resume-paper ${sectionSelector}${targetSelector}`
      : `.resume-paper ${sectionSelector} ${targetSelector}`;
  return [...scrollRoot.querySelectorAll<HTMLElement>(selector)];
}

function cssAttr(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}
