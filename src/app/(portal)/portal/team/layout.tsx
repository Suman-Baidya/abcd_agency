import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Engineering Pod — ABCD Digital Hub | Dedicated Architects",
  description: "Meet the engineering pod, designers, and system architects delivering your project at ABCD Digital Hub.",
};

export default function PortalTeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
