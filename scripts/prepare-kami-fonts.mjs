import { Buffer } from "node:buffer";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fontSplit } from "cn-font-split";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_DIR = path.join(ROOT, ".fonts-cache");
const PUBLIC_DIR = path.join(ROOT, "public", "fonts", "tsanger");

const FACES = [
  {
    weight: "400",
    file: "TsangerJinKai02-W04.ttf",
    size: 18_948_244,
  },
  {
    weight: "500",
    file: "TsangerJinKai02-W05.ttf",
    size: 18_953_516,
  },
];

const SOURCE_BASES = [
  "https://raw.githubusercontent.com/tw93/Kami/main/assets/fonts",
  "https://cdn.jsdmirror.com/gh/tw93/Kami@main/assets/fonts",
];

async function main() {
  await mkdir(CACHE_DIR, { recursive: true });
  await rm(PUBLIC_DIR, { recursive: true, force: true });
  await mkdir(PUBLIC_DIR, { recursive: true });

  for (const face of FACES) {
    const ttfPath = await downloadFace(face);
    const splitDir = path.join(CACHE_DIR, "split", face.weight);
    await rm(splitDir, { recursive: true, force: true });
    await mkdir(splitDir, { recursive: true });

    const input = new Uint8Array(await readFile(ttfPath));
    await fontSplit({
      input,
      outDir: splitDir,
      chunkSize: 70 * 1024,
      testHtml: false,
      reporter: false,
      css: {
        fontFamily: "TsangerJinKai02",
        fontWeight: face.weight,
        fontDisplay: "swap",
        commentBase: false,
        commentNameTable: false,
        commentUnicodes: false,
        compress: false,
      },
    });

    const publicFaceDir = path.join(PUBLIC_DIR, face.weight);
    await mkdir(publicFaceDir, { recursive: true });

    const cssName = (await readdir(splitDir)).find((name) => name.endsWith(".css"));
    if (!cssName) {
      throw new Error(`cn-font-split produced no CSS for weight ${face.weight}`);
    }

    const woff2Files = (await readdir(splitDir)).filter((name) => name.endsWith(".woff2"));
    for (const file of woff2Files) {
      await writeFile(path.join(publicFaceDir, file), await readFile(path.join(splitDir, file)));
    }

    const css = await readFile(path.join(splitDir, cssName), "utf8");
    const rewritten = css.replace(/url\((['"]?)(?:\.\/)?([^'")]+)\1\)/g, (_match, _quote, asset) => {
      const fileName = path.posix.basename(asset.replaceAll("\\", "/"));
      return `url("/fonts/tsanger/${face.weight}/${fileName}")`;
    });
    await writeFile(path.join(PUBLIC_DIR, `${face.weight}.css`), rewritten);
    console.log(`prepared TsangerJinKai02 ${face.weight}: ${woff2Files.length} woff2 chunks`);
  }
}

async function downloadFace(face) {
  const dest = path.join(CACHE_DIR, face.file);
  try {
    const existing = await readFile(dest);
    if (existing.byteLength === face.size) return dest;
  } catch {
    // download below
  }

  let lastError = null;
  for (const base of SOURCE_BASES) {
    const url = `${base}/${face.file}`;
    try {
      console.log(`downloading ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.byteLength !== face.size) {
        throw new Error(`expected ${face.size} bytes, got ${bytes.byteLength}`);
      }
      await writeFile(dest, bytes);
      return dest;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error(`failed to download ${face.file}`);
}

await main();
