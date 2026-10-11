import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documents & Agreements — ABCD Digital Hub | Legal Execution & Assets",
  description: "Access and review legally signed statements of work, contracts, and uploaded project assets on ABCD Digital Hub.",
};

export default function PortalDocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
