export const EDITOR_STORAGE_KEY = "resume-md:v4";
export const LEGACY_EDITOR_STORAGE_KEY = "resume-md:v3";

export const COLOR_SCHEMES = ["light", "dark", "system"] as const;

export type ColorSchemePreference = (typeof COLOR_SCHEMES)[number];
export type ResolvedColorScheme = "light" | "dark";

export function resolveColorScheme(
  preference: ColorSchemePreference,
  systemDark: boolean,
): ResolvedColorScheme {
  if (preference === "light") return "light";
  if (preference === "dark") return "dark";
  return systemDark ? "dark" : "light";
}

export const COLOR_SCHEME_BOOT_SCRIPT = `(function(){
  try {
    var pref = "system";
    var raw = localStorage.getItem("${EDITOR_STORAGE_KEY}") || localStorage.getItem("${LEGACY_EDITOR_STORAGE_KEY}");
    if (raw) {
      var parsed = JSON.parse(raw);
      var scheme = parsed && parsed.chrome ? parsed.chrome.colorScheme : parsed && parsed.colorScheme;
      if (scheme === "light" || scheme === "dark" || scheme === "system") {
        pref = scheme;
      }
    }
    var dark = pref === "dark" || (pref !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  } catch (e) {}
})();`;
