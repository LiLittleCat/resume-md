import type { ThemeDefinition } from "@/core/schema";
import { scaleSpacing, text, withBullet } from "../shared";

const normalSpacing = {
  sectionGap: 6.5,
  itemGap: 4,
  contentGap: 2,
  bulletGap: 1.1,
  paragraphGap: 2,
  headerGap: 4.5,
};

export const minimalTheme: ThemeDefinition = {
  id: "minimal",
  name: "Minimal",
  fonts: {
    latin: "Inter",
    cjk: "Noto Sans SC",
    monospace: "JetBrains Mono",
  },
  colors: {
    text: "#1a1a1a",
    muted: "#5c5c5c",
    rule: "#1a1a1a",
    accent: "#1a1a1a",
    background: "#ffffff",
  },
  typography: withBullet({
    base: text(10.5, 400, 1.35),
    name: text(20, 700, 1.12, -0.02),
    headline: text(11, 500, 1.3),
    sectionTitle: text(12, 700, 1.2, 0.04),
    itemTitle: text(12, 600, 1.25),
    itemSubtitle: text(10, 500, 1.3),
    body: text(10.5, 400, 1.35),
    meta: text(9, 400, 1.3),
  }),
  spacing: normalSpacing,
  spacingPresets: {
    compact: scaleSpacing(normalSpacing, 0.72),
    normal: normalSpacing,
    relaxed: scaleSpacing(normalSpacing, 1.28),
  },
  layout: {
    experience: "default",
    projects: "default",
    skills: "inline",
    education: "default",
  },
  icons: {
    mode: "section",
    provider: "lucide",
    size: 11,
    strokeWidth: 1.75,
    gap: 1.6,
    sections: {
      summary: "summary",
      skills: "code",
      experience: "briefcase",
      projects: "project",
      education: "education",
    },
  },
  page: {
    size: "A4",
    margin: { top: 14, right: 16, bottom: 14, left: 16 },
  },
  pagination: {
    keepSectionTitleWithBody: true,
    keepItemHeaderWithBody: true,
    avoidBulletSplit: true,
  },
  components: {
    header: {
      alignment: "left",
      rule: false,
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
    sectionGap: { min: 4.5, ideal: 6.5, max: 9 },
    itemGap: { min: 2.5, ideal: 4, max: 6 },
  },
  localePresets: {
    "zh-CN": {
      typography: {
        base: { lineHeight: 1.45 },
        body: { lineHeight: 1.45 },
        name: { letterSpacing: 0.06 },
        sectionTitle: { letterSpacing: 0.12 },
      },
    },
    "en-US": {
      typography: {
        name: { letterSpacing: -0.022 },
        sectionTitle: { letterSpacing: 0.02 },
      },
    },
  },
};
