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
          whatsappNumber: staticConfig.contact.whatsapp,
          enableWhatsappWidget: true,
          requireEmailVerification: false,
          enableCareers: false,
          careersStatusText: "Currently Closed",
          careersNotice: "We are not actively hiring for full-time positions at the moment, but we welcome open applications for future engineering and design sprints.",
          enablePrivacyPolicy: true,
          privacyPolicyContent: null as string | null,
          privacyPolicyEffectiveDate: "August 2026",
          enableTermsOfService: true,
          termsOfServiceContent: null as string | null,
          termsOfServiceEffectiveDate: "August 2026",
          enableRefundPolicy: false,
          refundPolicyContent: null as string | null,
          refundPolicyEffectiveDate: "August 2026",
          enableCookiePolicy: false,
          cookiePolicyContent: null as string | null,
          cookiePolicyEffectiveDate: "August 2026",
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
        whatsappNumber: staticConfig.contact.whatsapp,
        enableWhatsappWidget: true,
        requireEmailVerification: false,
        enableCareers: false,
        careersStatusText: "Currently Closed",
        careersNotice: "We are not actively hiring for full-time positions at the moment, but we welcome open applications for future engineering and design sprints.",
        enablePrivacyPolicy: true,
        privacyPolicyContent: null as string | null,
        privacyPolicyEffectiveDate: "August 2026",
        enableTermsOfService: true,
        termsOfServiceContent: null as string | null,
        termsOfServiceEffectiveDate: "August 2026",
        enableRefundPolicy: false,
        refundPolicyContent: null as string | null,
        refundPolicyEffectiveDate: "August 2026",
        enableCookiePolicy: false,
        cookiePolicyContent: null as string | null,
        cookiePolicyEffectiveDate: "August 2026",
      };
    }
  },
  ["site-config"],
  { tags: ["site-config"], revalidate: 3600 }
);
