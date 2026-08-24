export const PANEL_LAYOUT = {
  left: { min: 280, max: 640, default: 380 },
  right: { min: 200, max: 380, default: 220 },
  previewMin: 500,
} as const;

export type PanelSide = "left" | "right";

export function clampPanelWidth(
  side: PanelSide,
  value: number,
  otherWidth: number,
  workspaceWidth: number,
): number {
  const spec = PANEL_LAYOUT[side];
  const available = workspaceWidth - otherWidth - PANEL_LAYOUT.previewMin;
  const max = Math.max(spec.min, Math.min(spec.max, available));
  return Math.round(Math.min(max, Math.max(spec.min, value)));
}
