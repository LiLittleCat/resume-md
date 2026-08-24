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

export function collectPageOffsets(input: {
  boxTops: number[];
  pages: PackedPage[];
  contentHeight: number;
  pageHeight: number;
}): number[] {
  const offsets = input.pages.map((page) => {
    const first = page.boxIds[0];
    if (first === undefined) return 0;
    return input.boxTops[Number(first)] ?? 0;
  });
  const result = offsets.length > 0 ? offsets : [0];
  const pageHeight = input.pageHeight;
  if (!(pageHeight > 0) || !Number.isFinite(pageHeight)) return result;

  let cursor = result[result.length - 1] ?? 0;
  while (
    result.length < MAX_PREVIEW_PAGES &&
    input.contentHeight - cursor > pageHeight + 2
  ) {
    cursor += pageHeight;
    result.push(cursor);
  }
  return result;
}

export function sameOffsets(left: number[], right: number[]): boolean {
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) {
    if (Math.abs((left[index] ?? 0) - (right[index] ?? 0)) > 0.5) return false;
  }
  return true;
}
