export function StrongMeta({ text, strong }: { text: string; strong?: boolean }) {
  if (!text) return null;
  return strong ? <strong>{text}</strong> : text;
}
