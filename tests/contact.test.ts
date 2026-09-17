import { describe, expect, it } from "vitest";
import { contactHref, contactLineStarts } from "@/components/resume/contact";

describe("contactHref", () => {
  it("turns protocol-less website values into absolute https URLs", () => {
    expect(contactHref("website", "yl.do")).toBe("https://yl.do");
  });

  it("keeps explicit http and https URLs", () => {
    expect(contactHref("website", "https://yl.do")).toBe("https://yl.do");
    expect(contactHref("website", "http://yl.do")).toBe("http://yl.do");
  });

  it("does the same for github and linkedin", () => {
    expect(contactHref("github", "github.com/zhangsan")).toBe("https://github.com/zhangsan");
    expect(contactHref("linkedin", "linkedin.com/in/zhangsan")).toBe(
      "https://linkedin.com/in/zhangsan",
    );
  });
});

describe("contactLineStarts", () => {
  it("marks the first contact on each wrapped row", () => {
    expect(
      contactLineStarts({
        containerWidth: 100,
        itemWidths: [30, 30, 30],
        separatorWidth: 5,
        outerGap: 5,
        innerGap: 5,
      }),
    ).toEqual([0, 2]);
  });

  it("keeps all contacts on one row when they fit", () => {
    expect(
      contactLineStarts({
        containerWidth: 120,
        itemWidths: [30, 30, 30],
        separatorWidth: 5,
        outerGap: 5,
        innerGap: 5,
      }),
    ).toEqual([0]);
  });
});
