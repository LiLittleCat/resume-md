export const PREVIEW_SCALE = {
  min: 0.25,
  max: 3,
  default: 0.82,
} as const;

export type ZoomAction = "in" | "out" | "reset";

export function clampPreviewScale(scale: number): number {
  if (!Number.isFinite(scale)) return PREVIEW_SCALE.default;
  return Math.min(PREVIEW_SCALE.max, Math.max(PREVIEW_SCALE.min, scale));
}

export function formatPreviewScale(scale: number): string {
  return `${Math.round(clampPreviewScale(scale) * 100)}%`;
}

export function fitPreviewScale({
  containerWidth,
  containerHeight,
  pageWidth,
  pageHeight,
  paddingX = 64,
  paddingY = 64,
}: {
  containerWidth: number;
  containerHeight: number;
  pageWidth: number;
  pageHeight: number;
  paddingX?: number;
  paddingY?: number;
}): number {
  if (pageWidth <= 0 || pageHeight <= 0) return PREVIEW_SCALE.default;
  const widthScale = Math.max(0, containerWidth - paddingX) / pageWidth;
  const heightScale = Math.max(0, containerHeight - paddingY) / pageHeight;
  return clampPreviewScale(Math.min(widthScale, heightScale));
}

export function applyWheelZoom(scale: number, deltaY: number, deltaMode = 0): number {
  const pixels = deltaMode === 1 ? deltaY * 16 : deltaMode === 2 ? deltaY * windowInnerHeight() : deltaY;
  return clampPreviewScale(scale * Math.exp(-pixels / 420));
}

export function applyKeyboardZoom(scale: number, action: ZoomAction): number {
  if (action === "reset") return PREVIEW_SCALE.default;
  const factor = 1.1;
  return clampPreviewScale(action === "in" ? scale * factor : scale / factor);
}

export function isZoomWheel(event: { ctrlKey: boolean; metaKey: boolean }): boolean {
  return event.ctrlKey || event.metaKey;
}

export function parseZoomKey(event: {
  key: string;
  code?: string;
  ctrlKey: boolean;
  metaKey: boolean;
}): ZoomAction | null {
  if (!event.ctrlKey && !event.metaKey) return null;
  if (event.key === "=" || event.key === "+" || event.code === "Equal" || event.code === "NumpadAdd") {
    return "in";
  }
  if (event.key === "-" || event.key === "_" || event.code === "Minus" || event.code === "NumpadSubtract") {
    return "out";
  }
  if (event.key === "0" || event.code === "Digit0" || event.code === "Numpad0") {
    return "reset";
  }
  return null;
}

function windowInnerHeight(): number {
  return typeof window === "undefined" ? 800 : window.innerHeight;
}
