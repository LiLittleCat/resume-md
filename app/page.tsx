import { readFileSync } from "node:fs";
import path from "node:path";
import { EditorApp } from "@/components/editor/editor-app";
import { ResumeConfigSchema } from "@/core/schema";

export default function Page() {
  const examplesDir = path.join(process.cwd(), "examples");
  const examples = {
    "zh-CN": readFileSync(path.join(examplesDir, "resume.zh-CN.md"), "utf8"),
    "en-US": readFileSync(path.join(examplesDir, "resume.en-US.md"), "utf8"),
  };
  const defaultConfig = ResumeConfigSchema.parse(
    JSON.parse(readFileSync(path.join(examplesDir, "resume.config.json"), "utf8")),
  );

  return <EditorApp examples={examples} defaultConfig={defaultConfig} />;
}
