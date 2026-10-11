import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Onboarding — ABCD Digital Hub | Company Profile Setup",
  description: "Complete your business onboarding and project preferences on ABCD Digital Hub.",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
