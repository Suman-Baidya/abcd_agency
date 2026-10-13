import React from "react";
import { NotFoundContent } from "@/components/marketing/NotFoundContent";

export const metadata = {
  title: "404 — Page Not Found | ABCD Digital Hub",
  description: "The page you are looking for does not exist or has been moved.",
};

export default function MarketingNotFound() {
  return <NotFoundContent />;
}
