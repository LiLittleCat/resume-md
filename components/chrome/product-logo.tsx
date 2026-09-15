export const PRODUCT_LOGO_PAPER = "#F3EEE4";
export const PRODUCT_LOGO_INK = "#2C261E";
export const PRODUCT_LOGO_HASH = "#8F6230";

export function ProductLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="1.1"
        y="1.1"
        width="29.8"
        height="29.8"
        rx="7.2"
        fill={PRODUCT_LOGO_PAPER}
        stroke={PRODUCT_LOGO_INK}
        strokeWidth="1.5"
      />
      <path
        fill={PRODUCT_LOGO_HASH}
        d="M11.35 5.7h2.3v11.5h-2.3zm7 0h2.3v11.5h-2.3zM9.4 8.35h13.2v2.2H9.4zm0 4.55h13.2v2.2H9.4z"
      />
      <g stroke={PRODUCT_LOGO_INK} strokeLinecap="butt" strokeWidth="1.05">
        <path d="M8.8 20.9h14.4" />
        <path d="M8.8 23.85h11.2" />
        <path d="M8.8 26.8h7.6" />
      </g>
    </svg>
  );
}
