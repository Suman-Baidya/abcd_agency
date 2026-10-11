import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Proposals & Inquiries — ABCD Digital Hub",
  description: "Review preliminary project briefs, quotes, and technical proposals on ABCD Digital Hub.",
};

export default function PortalInquiriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
