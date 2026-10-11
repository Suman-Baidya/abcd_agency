import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getSiteConfig } from "@/lib/dbConfig";
import SettingsTabs from "./SettingsTabs";
import { db } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Site Settings & Configuration — ABCD Digital Hub",
  description: "Manage global agency branding, SEO, contact information, and business policies.",
};

export default async function SettingsPage() {
  const [config, pricingPackages, pricingServices] = await Promise.all([
    getSiteConfig(),
    db.pricingPackage.findMany({ orderBy: { order: "asc" } }),
    db.pricingService.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <Suspense fallback={<div className="py-16 text-center text-xs font-mono text-[#737373]">Loading site management...</div>}>
      <SettingsTabs
        initialConfig={config}
        pricingPackages={pricingPackages}
        pricingServices={pricingServices}
      />
    </Suspense>
  );
}
