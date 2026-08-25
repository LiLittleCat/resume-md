import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const GITHUB_REPOSITORY_URL = "https://github.com/LiLittleCat/resume-md";

export function GithubLink({
  className,
  iconOnly = false,
}: {
  className?: string;
  iconOnly?: boolean;
}) {
  return (
    <a
      href={GITHUB_REPOSITORY_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="GitHub"
      title="GitHub"
      className={cn(
        iconOnly
          ? "flex size-7 items-center justify-center rounded-md text-muted-foreground transition-[transform,background-color,color] duration-150 hover:text-foreground active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
          : buttonVariants({ variant: "ghost", size: "sm" }),
        className,
      )}
    >
      <GithubOutline />
      {iconOnly ? null : "GitHub"}
    </a>
  );
}

function GithubOutline() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-3.5"
    >
      <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
    </svg>
  );
}
