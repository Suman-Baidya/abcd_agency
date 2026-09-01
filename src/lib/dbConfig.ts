import { db } from "./prisma";
import { unstable_cache } from "next/cache";
import { siteConfig as staticConfig } from "./siteConfig";

export const getSiteConfig = unstable_cache(
  async () => {
    try {
      const config = await db.siteConfig.findUnique({
        where: { id: "1" },
      });
      
      if (!config) {
        // If DB has no config yet, fallback to static defaults
        return {
          agencyName: staticConfig.name,
          contactEmail: staticConfig.contact.email,
          contactPhone: staticConfig.contact.mobile,
          websiteUrl: staticConfig.url,
          address: "Tripura, India",
          lightLogoUrl: null as string | null,
          darkLogoUrl: null as string | null,
          faviconUrl: null as string | null,
          linkedinUrl: staticConfig.social.linkedin,
          facebookUrl: staticConfig.social.facebook,
          instagramUrl: staticConfig.social.instagram,
          youtubeUrl: staticConfig.social.youtube,
          twitterUrl: staticConfig.social.x,
          behanceUrl: null as string | null,
          whatsappNumber: staticConfig.social.whatsapp,
          enableWhatsappWidget: true,
          requireEmailVerification: false,
        };
      }
      
      return config;
    } catch (e) {
      console.error("Error fetching site config:", e);
      // Fallback if DB connection fails
      return {
        agencyName: staticConfig.name,
        contactEmail: staticConfig.contact.email,
        contactPhone: staticConfig.contact.mobile,
        websiteUrl: staticConfig.url,
        address: "Tripura, India",
        lightLogoUrl: null as string | null,
        darkLogoUrl: null as string | null,
        faviconUrl: null as string | null,
        linkedinUrl: staticConfig.social.linkedin,
        facebookUrl: staticConfig.social.facebook,
        instagramUrl: staticConfig.social.instagram,
        youtubeUrl: staticConfig.social.youtube,
        twitterUrl: staticConfig.social.x,
        behanceUrl: null as string | null,
        whatsappNumber: staticConfig.social.whatsapp,
        enableWhatsappWidget: true,
        requireEmailVerification: false,
      };
    }
  },
  ["site-config"],
  { tags: ["site-config"], revalidate: 3600 }
);
