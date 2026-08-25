export const PANEL_LAYOUT = {
  left: { min: 240, defaultRatio: 0.5 },
  right: { min: 200, default: 260, autoCollapseBelow: 1120 },
  previewMin: 240,
} as const;

export type PanelSide = "left" | "right";

export function clampPanelWidth(
  side: PanelSide,
  value: number,
  otherWidth: number,
  workspaceWidth: number,
): number {
  const spec = PANEL_LAYOUT[side];
  const preservedWidth = side === "left" ? PANEL_LAYOUT.previewMin : PANEL_LAYOUT.left.min;
  const available = workspaceWidth - otherWidth - preservedWidth;
  const max = Math.max(spec.min, available);
  return Math.round(Math.min(max, Math.max(spec.min, value)));
}

export function clampPanelRatio(value: number): number {
  return Math.min(1, Math.max(0, value));
}
