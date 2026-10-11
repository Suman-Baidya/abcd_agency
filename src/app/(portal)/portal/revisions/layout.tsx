import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Change Orders & QA Feedback — ABCD Digital Hub | Sprint Revisions",
  description: "Submit QA feedback and request sprint changes or change orders on ABCD Digital Hub.",
};

export default function PortalRevisionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
