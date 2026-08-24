import { compileResume } from "@/core/compile";
import { ResumeConfigSchema } from "@/core/schema";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { source?: unknown; config?: unknown };
    if (typeof body.source !== "string" || body.source.trim().length === 0) {
      return new Response("Missing markdown source", { status: 400 });
    }

    const config = ResumeConfigSchema.parse(body.config ?? {});
    const compiled = compileResume({ source: body.source, config });
    const pdf = await renderPdf(request, body.source, config);
    const rawName = compiled.resume.profile.name || "resume";
    const asciiName = (rawName.replace(/[^\x20-\x7E]/g, "").trim() || "resume").replace(/\s+/g, "-");
    const encodedName = encodeURIComponent(`${rawName}.pdf`);
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${asciiName}.pdf"; filename*=UTF-8''${encodedName}`,
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
): Promise<Buffer> {
  const { chromium } = await import("playwright");
  const browser = await launchChromium(chromium);
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
    await page.evaluate(async () => {
      const sample = document.querySelector(".resume-root")?.textContent ?? "中文简历";
      const families = ["Noto Sans SC", "Noto Serif SC", "Inter", "Source Serif 4", "JetBrains Mono"];
      const weights = ["400", "500", "600", "700"];
      await Promise.all(
        families.flatMap((family) =>
          weights.map((weight) => document.fonts.load(`${weight} 16px "${family}"`, sample)),
        ),
      );
      await document.fonts.ready;
    });
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

async function launchChromium(
  chromium: typeof import("playwright").chromium,
) {
  const args = ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none"];
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
