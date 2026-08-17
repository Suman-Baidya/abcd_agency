import React from "react";
import { siteConfig } from "@/lib/siteConfig";

export function ContactInfo() {
  return (
    <div className="rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#111111] p-6 sm:p-8 space-y-8 transition-colors duration-200">
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-[#737373] dark:text-neutral-400 mb-2">
          Direct Channels
        </p>
        <h3 className="text-xl font-bold text-[#0A0A0A] dark:text-white tracking-tight mb-4">
          Connect with our engineering team
        </h3>
        <p className="text-sm text-[#737373] dark:text-neutral-400 leading-relaxed">
          We skip the sales layers. Inquiries go directly to technical leads who can assess feasibility and provide realistic timelines immediately.
        </p>
      </div>

      <div className="space-y-4 pt-6 border-t border-[#E5E5E5] dark:border-[#262626]">
        <div>
          <p className="text-xs font-semibold text-[#0A0A0A] dark:text-white">General &amp; Project Inquiries</p>
          <a
            href={`mailto:${siteConfig.contact.email}`}
            className="text-sm font-medium text-[#0A0A0A] dark:text-neutral-200 hover:underline underline-offset-4"
          >
            {siteConfig.contact.email}
          </a>
        </div>

        <div>
          <p className="text-xs font-semibold text-[#0A0A0A] dark:text-white">Mobile</p>
          <a
            href={siteConfig.contact.mobile}
            className="text-sm font-medium text-[#0A0A0A] dark:text-neutral-200 hover:underline underline-offset-4"
          >
            {siteConfig.contact.mobileDisplay}
          </a>
        </div>

        <div>
          <p className="text-xs font-semibold text-[#0A0A0A] dark:text-white">WhatsApp</p>
          <a
            href={siteConfig.social.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[#0A0A0A] dark:text-neutral-200 hover:underline underline-offset-4"
          >
            {siteConfig.contact.whatsappDisplay}
          </a>
        </div>

        <div>
          <p className="text-xs font-semibold text-[#0A0A0A] dark:text-white">Response SLA</p>
          <p className="text-sm text-[#737373] dark:text-neutral-400">Within 24 business hours</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-[#0A0A0A] dark:text-white">Office &amp; Engineering Hub</p>
          <p className="text-sm text-[#737373] dark:text-neutral-400">
            Bengaluru / Remote Worldwide (IST &amp; UTC coverage)
          </p>
        </div>
      </div>

      <div className="pt-6 border-t border-[#E5E5E5] dark:border-[#262626]">
        <div className="p-4 rounded-lg bg-white dark:bg-[#161616] border border-[#E5E5E5] dark:border-[#262626]">
          <p className="text-xs font-bold text-[#0A0A0A] dark:text-white mb-1">
            Need an urgent technical consultation?
          </p>
          <p className="text-xs text-[#737373] dark:text-neutral-400">
            Mention your launch date in the message, and we will prioritize an expedited review.
          </p>
        </div>
      </div>
    </div>
  );
}
