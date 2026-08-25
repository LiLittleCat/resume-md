import { EditorApp } from "@/components/editor/editor-app";
import { loadBundledExamples } from "@/lib/example-documents";

export default function Page() {
  const { examples, defaultConfig } = loadBundledExamples();
  return <EditorApp examples={examples} defaultConfig={defaultConfig} />;
}
