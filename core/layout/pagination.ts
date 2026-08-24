export interface LayoutBox {
  id: string;
  height: number;
  keepTogether?: boolean;
  keepWithNext?: boolean;
}

export interface PackedPage {
  boxIds: string[];
  height: number;
}

/**
 * Greedy packer for A4 preview. Advanced TeX-style glue is reserved.
 * Print still uses CSS break-inside / break-after rules.
 */
export function packPages(boxes: LayoutBox[], pageHeight: number): PackedPage[] {
  const pages: PackedPage[] = [];
  let current: PackedPage = { boxIds: [], height: 0 };

  const flush = () => {
    if (current.boxIds.length === 0) return;
    pages.push(current);
    current = { boxIds: [], height: 0 };
  };

  for (let index = 0; index < boxes.length; index += 1) {
    const box = boxes[index];
    if (!box) continue;

    let blockHeight = box.height;
    const groupedIds = [box.id];

    if (box.keepWithNext) {
      const next = boxes[index + 1];
      if (next) {
        blockHeight += next.height;
        groupedIds.push(next.id);
      }
    }

    const fits = current.height + blockHeight <= pageHeight || current.boxIds.length === 0;
    if (!fits) flush();

    if (box.keepWithNext && groupedIds.length > 1) {
      current.boxIds.push(...groupedIds);
      current.height += blockHeight;
      index += 1;
      continue;
    }

    current.boxIds.push(box.id);
    current.height += box.height;
  }

  flush();
  return pages.length > 0 ? pages : [{ boxIds: [], height: 0 }];
}

export function estimatePageCount(contentHeight: number, pageHeight: number): number {
  if (pageHeight <= 0) return 1;
  return Math.max(1, Math.ceil(contentHeight / pageHeight));
}

const MAX_PREVIEW_PAGES = 50;

export interface OffsetBox {
  top: number;
  height: number;
  keepTogether?: boolean;
  keepWithNext?: boolean;
}

export function collectPageOffsets(input: {
  boxes: OffsetBox[];
  contentHeight: number;
  pageHeight: number;
}): number[] {
  const pageHeight = input.pageHeight;
  if (!(pageHeight > 0) || !Number.isFinite(pageHeight)) return [0];

  const offsets = [0];
  let pageStart = 0;
  const boxes = input.boxes;

  for (let index = 0; index < boxes.length; index += 1) {
    const box = boxes[index];
    if (!box) continue;
    const next = boxes[index + 1];
    const top = box.top;
    const bottom =
      box.keepWithNext && next ? next.top + next.height : box.top + box.height;
    const pageBottom = pageStart + pageHeight;
    if (bottom > pageBottom + 1 && top > pageStart + 1) {
      offsets.push(top);
      pageStart = top;
    }
    if (box.keepWithNext && next) index += 1;
  }

  let cursor = offsets[offsets.length - 1] ?? 0;
  while (
    offsets.length < MAX_PREVIEW_PAGES &&
    input.contentHeight - cursor > pageHeight + 2
  ) {
    const sliced = boxes.find(
      (box) => cursor + pageHeight > box.top + 1 && cursor + pageHeight < box.top + box.height - 1,
    );
    cursor = sliced ? sliced.top + sliced.height : cursor + pageHeight;
    if (cursor <= (offsets[offsets.length - 1] ?? 0) + 1) break;
    offsets.push(cursor);
  }
  return offsets;
}

export function sameOffsets(left: number[], right: number[]): boolean {
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) {
    if (Math.abs((left[index] ?? 0) - (right[index] ?? 0)) > 0.5) return false;
  }
  return true;
}
