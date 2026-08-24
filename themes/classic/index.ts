import type { ThemeDefinition } from "@/core/schema";
import { scaleSpacing, text, withBullet } from "../shared";

const normalSpacing = {
  sectionGap: 6.2,
  itemGap: 3.8,
  contentGap: 2,
  bulletGap: 1,
  paragraphGap: 2,
  headerGap: 4,
};

export const classicTheme: ThemeDefinition = {
  id: "classic",
  name: "Classic",
  fonts: {
    latin: "Source Serif 4",
    cjk: "Noto Serif SC",
    monospace: "JetBrains Mono",
  },
  colors: {
    text: "#1f1a14",
    muted: "#6b5e4e",
    rule: "#1f1a14",
    accent: "#1f1a14",
    background: "#fffdf8",
  },
  typography: withBullet({
    base: text(10.5, 400, 1.4),
    name: text(22, 700, 1.1, 0),
    headline: text(11, 500, 1.35),
    sectionTitle: text(12, 700, 1.2, 0.08),
    itemTitle: text(11, 600, 1.28),
    itemSubtitle: text(10, 500, 1.35),
    body: text(10.5, 400, 1.4),
    meta: text(9, 400, 1.3),
  }),
  spacing: normalSpacing,
  spacingPresets: {
    compact: scaleSpacing(normalSpacing, 0.75),
    normal: normalSpacing,
    relaxed: scaleSpacing(normalSpacing, 1.26),
  },
  layout: {
    experience: "default",
    projects: "default",
    skills: "inline",
    education: "default",
  },
  icons: {
    mode: "none",
    provider: "lucide",
    size: 10,
    strokeWidth: 1.6,
    gap: 1.5,
    sections: {},
  },
  page: {
    size: "A4",
    margin: { top: 16, right: 18, bottom: 16, left: 18 },
  },
  pagination: {
    keepSectionTitleWithBody: true,
    keepItemHeaderWithBody: true,
    avoidBulletSplit: true,
  },
  components: {
    header: {
      alignment: "center",
      rule: true,
      contactSeparator: "|",
    },
    sectionTitle: {
      transform: "none",
      rule: true,
    },
  },
  flexibleSpacing: {
    sectionGap: { min: 4.5, ideal: 6.2, max: 8.5 },
    itemGap: { min: 2.4, ideal: 3.8, max: 5.5 },
  },
  localePresets: {
    "zh-CN": {
      typography: {
        name: { letterSpacing: 0.12 },
        sectionTitle: { letterSpacing: 0.16 },
      },
    },
  },
};
