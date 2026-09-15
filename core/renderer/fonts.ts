export const RESUME_FONTS_STYLESHEET =
  "https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+SC:wght@400;500;600;700&family=Noto+Serif+SC:wght@400;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&display=swap";

export const TSANGER_JINKAI_FAMILY = "TsangerJinKai02";

export const TSANGER_JINKAI_STYLESHEETS = [
  "/fonts/tsanger/400.css",
  "/fonts/tsanger/500.css",
] as const;

export function documentFontFamilies(fonts: {
  latin: string;
  cjk: string;
  monospace: string;
}): string[] {
  return [...new Set([fonts.latin, fonts.cjk, fonts.monospace])];
}

export function usesTsangerJinKai(fonts: {
  latin: string;
  cjk: string;
  monospace: string;
}): boolean {
  return documentFontFamilies(fonts).includes(TSANGER_JINKAI_FAMILY);
}
