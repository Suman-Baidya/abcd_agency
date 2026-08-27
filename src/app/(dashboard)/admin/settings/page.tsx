import { getSiteConfig } from "@/lib/dbConfig";
import SettingsTabs from "./SettingsTabs";
import { db } from "@/lib/prisma";

export default async function SettingsPage() {
  const [config, pricingPackages, pricingServices] = await Promise.all([
    getSiteConfig(),
    db.pricingPackage.findMany({ orderBy: { order: "asc" } }),
    db.pricingService.findMany({ orderBy: { order: "asc" } })
  ]);
  
  return <SettingsTabs 
    initialConfig={config} 
    pricingPackages={pricingPackages} 
    pricingServices={pricingServices} 
  />;
}
