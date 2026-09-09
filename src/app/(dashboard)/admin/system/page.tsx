import React from "react";
import { SystemInfoManager } from "@/components/dashboard/SystemInfoManager";

export const metadata = {
  title: "System Information & Health — ABCD Agency",
  description: "Live database telemetry, connection pooling, and traffic governors.",
};

export const dynamic = "force-dynamic";

export default function AdminSystemPage() {
  return <SystemInfoManager />;
}
