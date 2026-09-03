import type { ThemeDefinition } from "@/core/schema";
import { scaleSpacing, text, withBullet } from "../shared";

const normalSpacing = {
  sectionGap: 5.8,
  itemGap: 3.6,
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
    base: text(10.5, 400, 1.4),
    name: text(26, 500, 1, -0.008),
    headline: text(10.5, 500, 1.3),
    sectionTitle: text(13, 500, 1.25),
    itemTitle: text(11, 500, 1.3),
    itemSubtitle: text(9.5, 500, 1.4),
    body: text(10.5, 400, 1.4),
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
    mode: "full",
    provider: "phosphor",
    size: 12.5,
    strokeWidth: 1.5,
    gap: 1.5,
    sections: {},
  },
  page: {
    size: "A4",
    margin: { top: 14, right: 13, bottom: 14, left: 13 },
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
    itemGap: { min: 2.4, ideal: 3.6, max: 5.2 },
  },
  localePresets: {
    "zh-CN": {
      typography: {
        base: { letterSpacing: 0.033 },
        body: { letterSpacing: 0.033 },
        bullet: { letterSpacing: 0.033 },
        name: { fontSize: 26.5, letterSpacing: 0.019 },
        headline: { fontSize: 10.5, fontWeight: 400, lineHeight: 1.3 },
        sectionTitle: { fontSize: 12.5, letterSpacing: 0 },
        itemTitle: { fontSize: 11 },
        meta: { fontSize: 9 },
      },
    },
    "en-US": {
      typography: {
        base: { letterSpacing: 0 },
        body: { letterSpacing: 0 },
        bullet: { letterSpacing: 0 },
        name: { fontSize: 26, letterSpacing: -0.008 },
        headline: { fontSize: 10.5, fontWeight: 500 },
        sectionTitle: { fontSize: 13, letterSpacing: 0 },
        itemTitle: { fontSize: 11 },
        meta: { fontSize: 9 },
      },
    },
  },
};
