const INVALID_FILENAME_CHARS = /[\\/:*?"<>|]/g;
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;
const MAX_BASENAME_LENGTH = 120;

export function defaultExportBasename(name: string | undefined | null): string {
  const trimmed = (name ?? "").trim().replace(/\s+/g, "-");
  return trimmed || "resume";
}

export function sanitizeExportBasename(value: string): string {
  const withoutPdf = value.replace(/\.pdf$/i, "");
  const cleaned = withoutPdf
    .replace(CONTROL_CHARS, "")
    .replace(INVALID_FILENAME_CHARS, "")
    .replace(/\s+/g, " ")
    .replace(/^\.+/, "")
    .trim()
    .slice(0, MAX_BASENAME_LENGTH);

  return cleaned || "resume";
}

export function resolveExportBasename(
  requested: string | undefined,
  profileName: string | undefined | null,
): string {
  if (typeof requested === "string" && requested.trim()) {
    return sanitizeExportBasename(requested);
  }
  return defaultExportBasename(profileName);
}

export function exportPdfFilename(basename: string): string {
  return `${sanitizeExportBasename(basename)}.pdf`;
}

export function pdfContentDisposition(basename: string): string {
  const safe = sanitizeExportBasename(basename);
  const asciiName = (safe.replace(/[^\x20-\x7E]/g, "").trim() || "resume").replace(/\s+/g, "-");
  const encodedName = encodeURIComponent(`${safe}.pdf`);
  return `attachment; filename="${asciiName}.pdf"; filename*=UTF-8''${encodedName}`;
}
