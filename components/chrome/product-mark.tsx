import Link from "next/link";
import { ProductLogo } from "./product-logo";

export function ProductMark({
  href,
  title,
  size = "default",
}: {
  href?: string;
  title?: string;
  size?: "default" | "large";
}) {
  const textSize = size === "large" ? "text-[18px]" : "text-[15px]";
  const logoSize = size === "large" ? "size-6" : "size-5";
  const mark = (
    <span className="flex items-center gap-2">
      <ProductLogo className={logoSize} />
      <span className="flex items-baseline gap-1.5">
        <span className={`${textSize} font-medium tracking-[-0.02em] text-foreground`}>Resume</span>
        <span className={`${textSize} font-medium tracking-[-0.02em] text-primary`}>MD</span>
      </span>
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
