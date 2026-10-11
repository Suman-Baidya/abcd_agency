import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects & Tasks — ABCD Digital Hub | Milestone Tracking",
  description: "Track project milestones, active sprint tasks, and production deliverables on ABCD Digital Hub.",
};

export default function PortalProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
