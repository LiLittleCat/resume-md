import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseResumeMarkdown, setFrontMatterAvatar } from "@/core/parser";

const example = readFileSync(path.join(process.cwd(), "examples/resume.zh-CN.md"), "utf8");

describe("setFrontMatterAvatar", () => {
  it("inserts a photo url into existing front matter", () => {
    const without = example.replace(/\navatar: .+\n/, "\n");
    const next = setFrontMatterAvatar(without, "https://cdn.example.com/me.jpg");
    const { resume } = parseResumeMarkdown(next);
    expect(resume.profile.avatar).toBe("https://cdn.example.com/me.jpg");
    expect(resume.profile.name).toBe("张三");
    expect(resume.profile.contact.email).toBe("zhangsan@example.com");
  });

  it("stores a data url and can remove it again", () => {
    const dataUrl = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD";
    const withPhoto = setFrontMatterAvatar(example, dataUrl);
    expect(parseResumeMarkdown(withPhoto).resume.profile.avatar).toBe(dataUrl);
    const removed = setFrontMatterAvatar(withPhoto, null);
    const parsed = parseResumeMarkdown(removed);
    expect(parsed.resume.profile.avatar).toBeUndefined();
    expect(parsed.resume.profile.name).toBe("张三");
  });
});
