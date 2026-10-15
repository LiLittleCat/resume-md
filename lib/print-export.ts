import type { ResumeConfig } from "@/core/schema";

/** sessionStorage key the `/print` page reads its document from. */
export const PRINT_PAYLOAD_KEY = "resume-md:print";

const READY_TIMEOUT_MS = 15_000;
/** Safari returns from print() before the dialog closes; drop the frame after this at the latest. */
const FRAME_CLEANUP_MS = 5 * 60_000;
const FONT_WEIGHTS = ["400", "500", "600", "700"];

/**
 * Prints the resume through the browser's own print dialog ("Save as PDF"), using the
 * `/print` page in a hidden same-origin iframe. Nothing leaves the device, and no server
 * rendering is needed, so it works on any static or edge host.
 */
export async function printResume(input: {
  source: string;
  config: ResumeConfig;
  /** Becomes the suggested PDF file name in the print dialog. */
  title: string;
  fontFamilies: string[];
}): Promise<void> {
  // A same-origin iframe shares this tab's sessionStorage.
  sessionStorage.setItem(
    PRINT_PAYLOAD_KEY,
    JSON.stringify({ source: input.source, config: input.config }),
  );

  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.tabIndex = -1;
  // Not display:none or 0×0: some browsers print such frames blank.
  Object.assign(frame.style, {
    position: "fixed",
    right: "0",
    bottom: "0",
    width: "1px",
    height: "1px",
    border: "0",
    opacity: "0",
    pointerEvents: "none",
  });

  const loaded = new Promise<void>((resolve) => {
    frame.addEventListener("load", () => resolve(), { once: true });
  });
  frame.src = "/print";
  document.body.appendChild(frame);

  const previousTitle = document.title;
  let cleanupTimer = 0;
  const cleanup = () => {
    window.clearTimeout(cleanupTimer);
    document.title = previousTitle;
    frame.remove();
    sessionStorage.removeItem(PRINT_PAYLOAD_KEY);
  };

  try {
    await loaded;
    const frameWindow = frame.contentWindow;
    const frameDocument = frame.contentDocument;
    if (!frameWindow || !frameDocument) throw new Error("Print frame did not load");

    await waitFor(
      () => frameDocument.documentElement.hasAttribute("data-print-ready"),
      READY_TIMEOUT_MS,
    );
    await loadFonts(frameDocument, input.fontFamilies);

    // Browsers name the PDF after the printed document's title; set both to be safe.
    frameDocument.title = input.title;
    document.title = input.title;

    frameWindow.addEventListener("afterprint", cleanup, { once: true });
    cleanupTimer = window.setTimeout(cleanup, FRAME_CLEANUP_MS);
    frameWindow.focus();
    frameWindow.print();
  } catch (error) {
    cleanup();
    throw error;
  }
}

async function loadFonts(frameDocument: Document, families: string[]) {
  const sample = frameDocument.querySelector(".resume-root")?.textContent || "中文简历 Resume";
  await Promise.all(
    families.flatMap((family) =>
      FONT_WEIGHTS.map((weight) =>
        frameDocument.fonts.load(`${weight} 16px "${family}"`, sample).catch(() => []),
      ),
    ),
  );
  await frameDocument.fonts.ready;
}

function waitFor(check: () => boolean, timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const tick = () => {
      if (check()) return resolve();
      if (Date.now() - started > timeoutMs) return reject(new Error("Print page timed out"));
      window.setTimeout(tick, 50);
    };
    tick();
  });
}
