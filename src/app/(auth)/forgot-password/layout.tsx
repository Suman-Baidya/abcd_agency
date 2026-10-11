import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password — ABCD Digital Hub | Account Security",
  description: "Secure password reset and recovery for your ABCD Digital Hub account.",
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
