import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Profile & Security — ABCD Digital Hub",
  description: "Manage client account details, company credentials, and contact preferences on ABCD Digital Hub.",
};

export default function PortalProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
