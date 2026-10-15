import { compileResume } from "@/core/compile";
import { documentFontFamilies } from "@/core/renderer";
import { ResumeConfigSchema } from "@/core/schema";
import { pdfContentDisposition, resolveExportBasename } from "@/lib/export-filename";
import { isAllowedPrintRequest, MAX_PDF_REQUEST_BYTES } from "@/lib/pdf-request-policy";
import serverlessChromium from "@sparticuz/chromium";
import { chromium, type Browser } from "playwright-core";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Renders the posted resume to PDF and forgets it. The resume is only held in memory for
 * this request: it is never written to disk or a database, never logged, never echoed in
 * an error, and the headless browser context that renders it is destroyed afterwards.
 */
export async function POST(request: Request) {
  let body: { source?: unknown; config?: unknown; filename?: unknown };
  try {
    const declared = Number(request.headers.get("content-length") ?? "0");
    if (declared > MAX_PDF_REQUEST_BYTES) return plain("Request too large", 413);
    const text = await request.text();
    if (text.length > MAX_PDF_REQUEST_BYTES) return plain("Request too large", 413);
    body = JSON.parse(text) as typeof body;
  } catch {
    return plain("Invalid request", 400);
  }

  if (typeof body.source !== "string" || body.source.trim().length === 0) {
    return plain("Missing markdown source", 400);
  }
  const parsedConfig = ResumeConfigSchema.safeParse(body.config ?? {});
  if (!parsedConfig.success) return plain("Invalid design settings", 400);

  try {
    const config = parsedConfig.data;
    const compiled = compileResume({ source: body.source, config });
    const rawName = compiled.resume.profile.name || "resume";
    const downloadName = resolveExportBasename(
      typeof body.filename === "string" ? body.filename : undefined,
      compiled.resume.profile.name,
    );
    const pdf = await renderPdf(
      printOrigin(request),
      body.source,
      config,
      rawName,
      documentFontFamilies(compiled.style.fonts),
    );
    return new Response(new Uint8Array(pdf), {
      headers: {
        ...PRIVATE_HEADERS,
        "Content-Type": "application/pdf",
        "Content-Disposition": pdfContentDisposition(downloadName),
      },
    });
  } catch (error) {
    // Only the error kind: messages can quote the page or the request.
    console.error("PDF export failed:", error instanceof Error ? error.name : "unknown error");
    return plain("PDF export failed", 500);
  }
}

const PRIVATE_HEADERS = {
  "Cache-Control": "no-store, private",
  "X-Content-Type-Options": "nosniff",
};

function plain(message: string, status: number) {
  return new Response(message, {
    status,
    headers: { ...PRIVATE_HEADERS, "Content-Type": "text/plain; charset=utf-8" },
  });
}

/**
 * Where the headless browser loads `/print` from. Self-hosted deployments behind a proxy
 * that does not validate the Host header should pin it with PDF_PRINT_ORIGIN.
 */
function printOrigin(request: Request): string {
  return process.env.PDF_PRINT_ORIGIN ?? new URL(request.url).origin;
}

async function renderPdf(
  origin: string,
  source: string,
  config: unknown,
  title: string,
  families: string[],
): Promise<Buffer> {
  const browser = await launchChromium();
  try {
    // A fresh, in-memory profile per request: nothing carries over between exports.
    const context = await browser.newContext({ serviceWorkers: "block" });
    await context.route("**/*", (route) => {
      const target = route.request();
      return isAllowedPrintRequest(target.url(), origin, target.resourceType())
        ? route.continue()
        : route.abort("blockedbyclient");
    });
    const page = await context.newPage();
    // The resume goes to the page in memory, never in the URL.
    await page.addInitScript(
      ({ payload, expectedOrigin }) => {
        if (location.origin === expectedOrigin) sessionStorage.setItem("resume-md:print", payload);
      },
      { payload: JSON.stringify({ source, config }), expectedOrigin: origin },
    );
    await page.goto(new URL("/print", origin).toString(), { waitUntil: "networkidle", timeout: 30_000 });
    await page.waitForSelector(".resume-root", { timeout: 15_000 });
    await page.waitForSelector("html[data-print-ready]", { timeout: 15_000 });
    await page.evaluate((documentTitle) => {
      document.title = documentTitle;
    }, title);
    await page.evaluate(async (fontFamilies) => {
      const sample = document.querySelector(".resume-root")?.textContent ?? "中文简历";
      const weights = ["400", "500", "600", "700"];
      await Promise.all(
        fontFamilies.flatMap((family) =>
          weights.map((weight) => document.fonts.load(`${weight} 16px "${family}"`, sample)),
        ),
      );
      await document.fonts.ready;
    }, families);
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    await context.close();
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

async function launchChromium(): Promise<Browser> {
  const args = ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none"];

  if (process.env.VERCEL) {
    return chromium.launch({
      headless: true,
      executablePath: await serverlessChromium.executablePath(),
      args: [...serverlessChromium.args, ...args],
    });
  }

  try {
    return await chromium.launch({
      headless: true,
      channel: "chrome",
      args,
    });
  } catch {
    return chromium.launch({
      headless: true,
      args,
    });
  }
}
