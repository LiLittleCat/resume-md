const MAX_EDGE = 640;
const JPEG_QUALITY = 0.86;

export function avatarOutputMimeType(inputType: string): "image/png" | "image/jpeg" {
  return inputType === "image/png" ? "image/png" : "image/jpeg";
}

export function shouldBakeAvatarSrc(src: string): boolean {
  return src.startsWith("data:image/png") || /\.png(?:$|[?#])/i.test(src);
}

export function compositeRgbaOverBackground(pixels: Uint8ClampedArray, background: string): void {
  const [red, green, blue] = parseHexColor(background);
  for (let index = 0; index < pixels.length; index += 4) {
    const alpha = pixels[index + 3] / 255;
    pixels[index] = Math.round(pixels[index] * alpha + red * (1 - alpha));
    pixels[index + 1] = Math.round(pixels[index + 1] * alpha + green * (1 - alpha));
    pixels[index + 2] = Math.round(pixels[index + 2] * alpha + blue * (1 - alpha));
    pixels[index + 3] = 255;
  }
}

export async function readAvatarFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("unsupported-image");
  }
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("unsupported-image");
  }
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const outputType = avatarOutputMimeType(file.type);
  return outputType === "image/png"
    ? canvas.toDataURL(outputType)
    : canvas.toDataURL(outputType, JPEG_QUALITY);
}

export async function bakeResumeAvatars(background: string): Promise<void> {
  const images = [...document.querySelectorAll<HTMLImageElement>("img.resume-avatar")];
  await Promise.all(images.map((image) => bakeAvatarImage(image, background)));
}

async function bakeAvatarImage(image: HTMLImageElement, background: string): Promise<void> {
  if (!shouldBakeAvatarSrc(image.src)) return;
  await image.decode().catch(() => undefined);
  if (!image.naturalWidth || !image.naturalHeight) return;

  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) return;

  try {
    context.drawImage(image, 0, 0);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    compositeRgbaOverBackground(imageData.data, background);
    context.putImageData(imageData, 0, 0);
  } catch {
    return;
  }

  image.src = canvas.toDataURL("image/png");
  await image.decode().catch(() => undefined);
}

function parseHexColor(color: string): [number, number, number] {
  const hex = color.trim();
  const short = /^#([0-9a-f]{3})$/i.exec(hex);
  if (short) {
    const [red, green, blue] = short[1];
    return [parseHexByte(red + red), parseHexByte(green + green), parseHexByte(blue + blue)];
  }
  const long = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!long) {
    throw new Error(`unsupported-color:${color}`);
  }
  return [parseHexByte(long[1].slice(0, 2)), parseHexByte(long[1].slice(2, 4)), parseHexByte(long[1].slice(4, 6))];
}

function parseHexByte(value: string): number {
  return Number.parseInt(value, 16);
}
