import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — ABCD Digital Hub | Client & Partner Portal",
  description:
    "Sign in to ABCD Digital Hub. Access active project sprints, software deliverables, legal agreements, and direct consultant channels.",
  openGraph: {
    title: "Sign In — ABCD Digital Hub | Client & Partner Portal",
    description: "Access your ABCD Digital Hub client dashboard, active projects, and sprint milestones.",
    siteName: "ABCD Digital Hub",
  },
  twitter: {
    title: "Sign In — ABCD Digital Hub | Client & Partner Portal",
    description: "Access your ABCD Digital Hub client dashboard, active projects, and sprint milestones.",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
