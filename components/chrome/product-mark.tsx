import Link from "next/link";

export function ProductMark({ href, title }: { href?: string; title?: string }) {
  const mark = (
    <span className="flex items-baseline gap-1.5">
      <span className="text-[15px] font-medium tracking-[-0.02em] text-foreground">Resume</span>
      <span className="text-[15px] font-medium tracking-[-0.02em] text-primary">MD</span>
    </span>
  );
  if (!href) return mark;
  return (
    <Link
      href={href}
      title={title}
      className="rounded-md outline-none transition-opacity duration-150 hover:opacity-70 focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      {mark}
    </Link>
  );
}
