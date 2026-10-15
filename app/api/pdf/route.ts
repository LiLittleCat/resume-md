import { compileResume } from "@/core/compile";
import { documentFontFamilies } from "@/core/renderer";
import { ResumeConfigSchema } from "@/core/schema";
import { pdfContentDisposition, resolveExportBasename } from "@/lib/export-filename";
import serverlessChromium from "@sparticuz/chromium";
import { chromium } from "playwright-core";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { source?: unknown; config?: unknown; filename?: unknown };
    if (typeof body.source !== "string" || body.source.trim().length === 0) {
      return new Response("Missing markdown source", { status: 400 });
    }

    const config = ResumeConfigSchema.parse(body.config ?? {});
    const compiled = compileResume({ source: body.source, config });
    const rawName = compiled.resume.profile.name || "resume";
    const downloadName = resolveExportBasename(
      typeof body.filename === "string" ? body.filename : undefined,
      compiled.resume.profile.name,
    );
    const pdf = await renderPdf(
      request,
      body.source,
      config,
      rawName,
      documentFontFamilies(compiled.style.fonts),
    );
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": pdfContentDisposition(downloadName),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PDF export failed";
    return new Response(message, { status: 500 });
  }
}

async function renderPdf(
  request: Request,
  source: string,
  config: unknown,
  title: string,
  families: string[],
): Promise<Buffer> {
  const browser = await launchChromium();
  try {
    const page = await browser.newPage();
    const printUrl = new URL("/print", request.url);
    await page.addInitScript(
      ({ payload }) => {
        sessionStorage.setItem("resume-md:print", payload);
      },
      { payload: JSON.stringify({ source, config }) },
    );
    await page.goto(printUrl.toString(), { waitUntil: "networkidle", timeout: 30_000 });
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
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

async function launchChromium() {
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
