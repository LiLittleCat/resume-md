import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProductLogo, PRODUCT_LOGO_HASH, PRODUCT_LOGO_PAPER } from "@/components/chrome/product-logo";
import { ProductMark } from "@/components/chrome/product-mark";

describe("product logo", () => {
  it("draws an A4 sheet whose heading is a markdown hash", () => {
    const html = renderToStaticMarkup(createElement(ProductLogo));
    const favicon = readFileSync(new URL("../app/icon.svg", import.meta.url), "utf8");

    expect(html).toContain(`fill="${PRODUCT_LOGO_PAPER}"`);
    expect(html).toContain(`fill="${PRODUCT_LOGO_HASH}"`);
    expect(html).toContain('viewBox="0 0 32 32"');
    expect(favicon).toContain('width="32" height="32"');
    expect(favicon).toContain('width="29.8" height="29.8"');
    expect(favicon).toContain('rx="7.2"');
    expect(favicon).not.toContain('width="18" height="25.5"');
    expect(favicon).toContain("#8F6230");
    expect(favicon).not.toMatch(/clipPath|gradient|feGaussianBlur/);
    const ico = readFileSync(new URL("../app/favicon.ico", import.meta.url));
    expect(ico.subarray(0, 4)).toEqual(Buffer.from([0, 0, 1, 0]));
  });

  it("sits beside the Resume MD wordmark", () => {
    const html = renderToStaticMarkup(createElement(ProductMark, { href: "/resumes" }));
    expect(html).toContain("Resume");
    expect(html).toContain("MD");
    expect(html).toContain("<svg");
  });
});
