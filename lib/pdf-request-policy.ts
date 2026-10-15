/**
 * Network policy for the headless browser that renders PDFs on the server. The resume is
 * user input, so the page may only reach this app, Google Fonts and public HTTPS images;
 * anything else (internal hosts, cloud metadata, other origins) is blocked.
 */

const FONT_HOSTS = new Set(["fonts.googleapis.com", "fonts.gstatic.com"]);

export function isAllowedPrintRequest(url: string, appOrigin: string, resourceType: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol === "data:" || parsed.protocol === "blob:") return true;
  if (parsed.origin === appOrigin) return true;
  if (parsed.protocol !== "https:") return false;
  if (FONT_HOSTS.has(parsed.hostname)) return true;
  // Remote avatars: images only, and only from public host names.
  return resourceType === "image" && isPublicHostname(parsed.hostname);
}

export function isPublicHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (!host.includes(".")) return false;
  if (host === "localhost" || /\.(localhost|local|internal|lan|home|corp)$/.test(host)) return false;
  // IP literals are never needed for avatars and are how private ranges get reached.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(":")) return false;
  return true;
}

/** Largest accepted request body: Markdown plus an embedded avatar. */
export const MAX_PDF_REQUEST_BYTES = 8 * 1024 * 1024;
