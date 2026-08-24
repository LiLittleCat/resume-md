import { PrintResume } from "@/components/preview/print-resume";

export const metadata = {
  title: "Resume MD Print",
  robots: { index: false, follow: false },
};

export default function PrintPage() {
  return <PrintResume />;
}
