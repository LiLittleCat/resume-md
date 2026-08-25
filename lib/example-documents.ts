import { readFileSync } from "node:fs";
import path from "node:path";
import { ResumeConfigSchema, type LocaleId, type ResumeConfig } from "@/core/schema";

export function loadBundledExamples(): {
  examples: Record<LocaleId, string>;
  defaultConfig: ResumeConfig;
} {
  const examplesDir = path.join(process.cwd(), "examples");
  return {
    examples: {
      "zh-CN": readFileSync(path.join(examplesDir, "resume.zh-CN.md"), "utf8"),
      "en-US": readFileSync(path.join(examplesDir, "resume.en-US.md"), "utf8"),
    },
    defaultConfig: ResumeConfigSchema.parse(
      JSON.parse(readFileSync(path.join(examplesDir, "resume.config.json"), "utf8")),
    ),
  };
}
