/**
 * ABCD Agency - Centralised Site Configuration
 * Single source of truth for all contact details, social-media URLs, and brand constants.
 * To update any detail: change it ONLY here. Never hardcode contact info in components.
 */

export const siteConfig = {
  name: "ABCD Agency",
  domain: "abcdagency.com",
  url: "https://abcdagency.com",

  // Contact
  contact: {
    /** Primary business email */
    email: "sb.abcd321@gmail.com",
    /** Mobile / general enquiries (with country code) */
    mobile: "+918944899747",
    /** Mobile number for display */
    mobileDisplay: "89448 99747",
    /** WhatsApp number with country code (no + prefix for wa.me) */
    whatsapp: "918167685731",
    /** WhatsApp number for display */
    whatsappDisplay: "81676 85731",
  },

  // Social Media
  social: {
    facebook: "https://www.facebook.com/profile.php?id=61593007787293",
    instagram: "https://www.instagram.com/theabcdagency/",
    youtube: "https://www.youtube.com/channel/UCVPuceJ8stYsxCvcplr3IMA",
    linkedin: "https://www.linkedin.com/company/theabcdagency",
    x: "https://x.com/theabcdagency",
    whatsapp: "https://wa.me/918167685731",
  },
} as const;

export type SiteConfig = typeof siteConfig;
