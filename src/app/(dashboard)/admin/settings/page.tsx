import { getSiteConfig } from "@/lib/dbConfig";
import SettingsTabs from "./SettingsTabs";
import { db } from "@/lib/prisma";

export default async function SettingsPage() {
  const config = await getSiteConfig();
  const pricingPackages = await db.pricingPackage.findMany({ orderBy: { order: "asc" } });
  const pricingServices = await db.pricingService.findMany({ orderBy: { order: "asc" } });
  
  return <SettingsTabs 
    initialConfig={config} 
    pricingPackages={pricingPackages} 
    pricingServices={pricingServices} 
  />;
}
