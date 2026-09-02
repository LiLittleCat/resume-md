import type { ThemeDefinition } from "@/core/schema";
import { scaleSpacing, text, withBullet } from "../shared";

const normalSpacing = {
  sectionGap: 5.8,
  itemGap: 2.6,
  contentGap: 1.7,
  bulletGap: 1,
  paragraphGap: 1.6,
  headerGap: 4.2,
};

export const kamiTheme: ThemeDefinition = {
  id: "kami",
  name: "Kami",
  fonts: {
    latin: "Charter",
    cjk: "TsangerJinKai02",
    monospace: "JetBrains Mono",
  },
  colors: {
    text: "#141413",
    muted: "#504e49",
    rule: "#e8e6dc",
    accent: "#1B365D",
    background: "#f5f4ed",
  },
  typography: withBullet({
    base: text(9.4, 400, 1.42),
    name: text(26, 500, 1, -0.008),
    headline: text(10.5, 500, 1.3),
    sectionTitle: text(13, 500, 1.25),
    itemTitle: text(11, 500, 1.3),
    itemSubtitle: text(9, 500, 1.4),
    body: text(9.4, 400, 1.42),
    meta: text(9, 400, 1.45),
  }),
  spacing: normalSpacing,
  spacingPresets: {
    compact: scaleSpacing(normalSpacing, 0.76),
    normal: normalSpacing,
    relaxed: scaleSpacing(normalSpacing, 1.24),
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
    strokeWidth: 1.5,
    gap: 1.5,
    sections: {},
  },
  page: {
    size: "A4",
    margin: { top: 11, right: 13, bottom: 11, left: 13 },
  },
  pagination: {
    keepSectionTitleWithBody: true,
    keepItemHeaderWithBody: true,
    avoidBulletSplit: true,
  },
  components: {
    header: {
      alignment: "left",
      rule: true,
      contactSeparator: "·",
    },
    sectionTitle: {
      transform: "none",
      rule: true,
    },
    avatar: {
      position: "right",
      shape: "square",
      sizeMm: 22,
    },
  },
  flexibleSpacing: {
    sectionGap: { min: 4.2, ideal: 5.8, max: 8 },
    itemGap: { min: 1.8, ideal: 2.6, max: 4.5 },
  },
  localePresets: {
    "zh-CN": {
      typography: {
        base: { fontSize: 9.2, lineHeight: 1.42, letterSpacing: 0.033 },
        body: { fontSize: 9.2, lineHeight: 1.42, letterSpacing: 0.033 },
        bullet: { fontSize: 9.2, lineHeight: 1.4, letterSpacing: 0.033 },
        name: { fontSize: 26.5, letterSpacing: 0.019 },
        sectionTitle: { fontSize: 12.5, letterSpacing: 0 },
      },
    },
    "en-US": {
      typography: {
        base: { fontSize: 9.4, lineHeight: 1.42, letterSpacing: 0 },
        body: { fontSize: 9.4, lineHeight: 1.42, letterSpacing: 0 },
        bullet: { fontSize: 9.4, lineHeight: 1.4, letterSpacing: 0 },
        name: { fontSize: 26, letterSpacing: -0.008 },
        sectionTitle: { fontSize: 13, letterSpacing: 0 },
      },
    },
  },
};
