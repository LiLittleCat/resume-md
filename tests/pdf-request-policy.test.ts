import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isAllowedPrintRequest, isPublicHostname } from "@/lib/pdf-request-policy";

const app = "https://resume.example.com";

describe("PDF render network policy", () => {
  it("allows the app itself, Google Fonts and inline data", () => {
    expect(isAllowedPrintRequest(`${app}/print`, app, "document")).toBe(true);
    expect(isAllowedPrintRequest(`${app}/_next/static/chunk.js`, app, "script")).toBe(true);
    expect(isAllowedPrintRequest("https://fonts.googleapis.com/css2?family=Inter", app, "stylesheet")).toBe(true);
    expect(isAllowedPrintRequest("https://fonts.gstatic.com/s/inter.woff2", app, "font")).toBe(true);
    expect(isAllowedPrintRequest("data:image/png;base64,AAAA", app, "image")).toBe(true);
  });

  it("allows remote avatars only as HTTPS images from public hosts", () => {
    expect(isAllowedPrintRequest("https://cdn.example.org/me.jpg", app, "image")).toBe(true);
    expect(isAllowedPrintRequest("http://cdn.example.org/me.jpg", app, "image")).toBe(false);
    expect(isAllowedPrintRequest("https://cdn.example.org/page", app, "document")).toBe(false);
    expect(isAllowedPrintRequest("https://cdn.example.org/x.js", app, "script")).toBe(false);
  });

  it("blocks internal addresses a crafted resume could point at", () => {
    for (const url of [
      "https://169.254.169.254/latest/meta-data/",
      "https://10.0.0.5/avatar.png",
      "https://[::1]/avatar.png",
      "https://localhost/avatar.png",
      "https://db.internal/avatar.png",
      "https://printer.local/avatar.png",
      "https://intranet/avatar.png",
      "file:///etc/passwd",
    ]) {
      expect(isAllowedPrintRequest(url, app, "image"), url).toBe(false);
    }
    expect(isPublicHostname("cdn.example.org")).toBe(true);
  });
});

describe("PDF route data handling", () => {
  const route = readFileSync(new URL("../app/api/pdf/route.ts", import.meta.url), "utf8");

  it("never logs or echoes request content and is never cached", () => {
    expect(route).not.toMatch(/console\.\w+\([^)]*(body|source|text|message)/);
    expect(route).not.toContain("error.message");
    expect(route).toContain('"Cache-Control": "no-store, private"');
  });

  it("renders in a throwaway context with the network policy applied", () => {
    expect(route).toContain("browser.newContext(");
    expect(route).toContain("isAllowedPrintRequest");
    expect(route).toContain("MAX_PDF_REQUEST_BYTES");
  });
});
