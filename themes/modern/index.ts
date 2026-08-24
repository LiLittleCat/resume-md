import type { ThemeDefinition } from "@/core/schema";
import { scaleSpacing, text, withBullet } from "../shared";

const normalSpacing = {
  sectionGap: 7,
  itemGap: 4.2,
  contentGap: 2.2,
  bulletGap: 1.2,
  paragraphGap: 2.2,
  headerGap: 5,
};

export const modernTheme: ThemeDefinition = {
  id: "modern",
  name: "Modern",
  fonts: {
    latin: "Inter",
    cjk: "Noto Sans SC",
    monospace: "JetBrains Mono",
  },
  colors: {
    text: "#151515",
    muted: "#667085",
    rule: "#d0d5dd",
    accent: "#1d4f91",
    background: "#ffffff",
  },
  typography: withBullet({
    base: text(10.5, 400, 1.38),
    name: text(22, 700, 1.08, -0.03),
    headline: text(11, 500, 1.3),
    sectionTitle: text(10, 700, 1.2, 0.16),
    itemTitle: text(11, 600, 1.25),
    itemSubtitle: text(10, 500, 1.3),
    body: text(10.5, 400, 1.38),
    meta: text(9, 400, 1.3),
  }),
  spacing: normalSpacing,
  spacingPresets: {
    compact: scaleSpacing(normalSpacing, 0.74),
    normal: normalSpacing,
    relaxed: scaleSpacing(normalSpacing, 1.24),
  },
  layout: {
    experience: "default",
    projects: "default",
    skills: "stacked",
    education: "default",
  },
  icons: {
    mode: "full",
    provider: "lucide",
    size: 10.5,
    strokeWidth: 1.85,
    gap: 1.8,
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
    margin: { top: 14, right: 15, bottom: 14, left: 15 },
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
      transform: "uppercase",
      rule: true,
    },
  },
  flexibleSpacing: {
    sectionGap: { min: 5, ideal: 7, max: 9.5 },
    itemGap: { min: 2.8, ideal: 4.2, max: 6.2 },
  },
  localePresets: {
    "zh-CN": {
      typography: {
        sectionTitle: { fontSize: 11, letterSpacing: 0.18 },
        name: { letterSpacing: 0.04 },
      },
    },
  },
};
