import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meetings & Syncs — ABCD Digital Hub | Schedule Sprint Calls",
  description: "Schedule sprint syncs, architecture consultations, and review calls with ABCD Digital Hub consultants.",
};

export default function PortalMeetingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
