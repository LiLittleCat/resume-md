import type { CompleteSpacing, CompleteTextStyle, CompleteTypography } from "@/core/schema";

export function text(
  fontSize: number,
  fontWeight: number,
  lineHeight: number,
  letterSpacing = 0,
): CompleteTextStyle {
  return { fontSize, fontWeight, lineHeight, letterSpacing };
}

export function scaleSpacing(base: CompleteSpacing, factor: number): CompleteSpacing {
  const round = (value: number) => Math.round(value * factor * 10) / 10;
  return {
    sectionGap: round(base.sectionGap),
    itemGap: round(base.itemGap),
    contentGap: round(base.contentGap),
    bulletGap: round(base.bulletGap),
    paragraphGap: round(base.paragraphGap),
    headerGap: round(base.headerGap),
  };
}

export function withBullet(typography: Omit<CompleteTypography, "bullet">): CompleteTypography {
  return {
    ...typography,
    bullet: { ...typography.body, lineHeight: Math.max(1.25, typography.body.lineHeight - 0.05) },
  };
}
