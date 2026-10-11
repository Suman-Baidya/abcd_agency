import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account — ABCD Digital Hub | Client Onboarding & Portal",
  description:
    "Register with ABCD Digital Hub to launch custom software engineering projects, access live staging environments, and manage sprint deliverables.",
  openGraph: {
    title: "Create Account — ABCD Digital Hub | Client Onboarding & Portal",
    description: "Register with ABCD Digital Hub to launch custom software engineering projects and manage sprint deliverables.",
    siteName: "ABCD Digital Hub",
  },
  twitter: {
    title: "Create Account — ABCD Digital Hub | Client Onboarding & Portal",
    description: "Register with ABCD Digital Hub to launch custom software engineering projects and manage sprint deliverables.",
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
