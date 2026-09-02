import React from "react";
import { Mail, MessageCircle } from "lucide-react";

export function QuickContactIcons({ siteConfig }: { siteConfig: any }) {
  return (
    <div className="flex items-center gap-1.5">
      {/* Email */}
      {siteConfig.contactEmail && (
        <a
          href={`mailto:${siteConfig.contactEmail}`}
          title="Email Us"
          aria-label="Email ABCD Agency"
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1E1E1E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white"
        >
          <Mail className="w-3.5 h-3.5" />
        </a>
      )}

      {/* WhatsApp */}
      {siteConfig.whatsappNumber && (
        <a
          href={`https://wa.me/${siteConfig.whatsappNumber.replace(/[^0-9]/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          title="WhatsApp"
          aria-label="WhatsApp ABCD Agency"
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1E1E1E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white"
        >
          <MessageCircle className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
}
