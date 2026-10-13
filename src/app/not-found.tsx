import React from "react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { NotFoundContent } from "@/components/marketing/NotFoundContent";
import { NotFoundShell } from "@/components/marketing/NotFoundShell";

export const metadata = {
  title: "404 — Page Not Found | ABCD Digital Hub",
  description: "The page you are looking for does not exist or has been moved.",
};

export default function NotFound() {
  return (
    <NotFoundShell navbar={<Navbar />} footer={<Footer />}>
      <NotFoundContent />
    </NotFoundShell>
  );
}
