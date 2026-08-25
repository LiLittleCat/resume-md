import { ResumeLibraryApp } from "@/components/library/resume-library-app";
import { loadBundledExamples } from "@/lib/example-documents";

export const metadata = {
  title: "Resume MD",
};

export default function ResumesPage() {
  const { examples, defaultConfig } = loadBundledExamples();
  return <ResumeLibraryApp examples={examples} defaultConfig={defaultConfig} />;
}
