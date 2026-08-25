"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import type { LocaleId } from "@/core/schema";
import type { ColorSchemePreference } from "@/lib/color-scheme";
import type { UiCopy } from "@/locales/ui";
import { GithubLink } from "./github-link";
import { IconToggle, IconToggleGroup } from "./icon-toggle";

export function HeaderControls({
  locale,
  colorScheme,
  ui,
  onLocaleChange,
  onColorSchemeChange,
}: {
  locale: LocaleId;
  colorScheme: ColorSchemePreference;
  ui: UiCopy;
  onLocaleChange: (locale: LocaleId) => void;
  onColorSchemeChange: (scheme: ColorSchemePreference) => void;
}) {
  return (
    <>
      <IconToggleGroup>
        <IconToggle
          pressed={locale === "zh-CN"}
          label={ui.localeZh}
          onPressed={() => onLocaleChange("zh-CN")}
        >
          中
        </IconToggle>
        <IconToggle
          pressed={locale === "en-US"}
          label={ui.localeEn}
          onPressed={() => onLocaleChange("en-US")}
        >
          EN
        </IconToggle>
      </IconToggleGroup>
      <IconToggleGroup>
        <IconToggle
          pressed={colorScheme === "light"}
          label={ui.schemeLight}
          onPressed={() => onColorSchemeChange("light")}
        >
          <Sun className="size-3.5" />
        </IconToggle>
        <IconToggle
          pressed={colorScheme === "dark"}
          label={ui.schemeDark}
          onPressed={() => onColorSchemeChange("dark")}
        >
          <Moon className="size-3.5" />
        </IconToggle>
        <IconToggle
          pressed={colorScheme === "system"}
          label={ui.schemeSystem}
          onPressed={() => onColorSchemeChange("system")}
        >
          <Monitor className="size-3.5" />
        </IconToggle>
      </IconToggleGroup>
      <IconToggleGroup>
        <GithubLink iconOnly />
      </IconToggleGroup>
    </>
  );
}
