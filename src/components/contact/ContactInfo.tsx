import React from "react";
import { getSiteConfig } from "@/lib/dbConfig";

/* ────────────────────────────────────────────────────────
   Inline SVG icons (monochrome, stroke-based)
──────────────────────────────────────────────────────── */
function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.983-1.417A9.956 9.956 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 9c.5 2 2.5 4 4.5 4.5M15.5 15c-2-.5-4-2.5-4.5-4.5m4.5 4.5-.5 1.5-2-1M8.5 9l-1.5-.5 1-2" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────
   Channel Card
──────────────────────────────────────────────────────── */
function ChannelCard({
  icon,
  label,
  value,
  href,
  isExternal = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  isExternal?: boolean;
}) {
  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="group flex items-center gap-4 p-4 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] hover:border-[#0A0A0A] dark:hover:border-white transition-all duration-200"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-md bg-[#F5F5F5] dark:bg-[#1A1A1A] flex items-center justify-center text-[#737373] dark:text-neutral-400 group-hover:bg-[#0A0A0A] group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-[#0A0A0A] transition-all duration-200">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#737373] dark:text-neutral-500 mb-0.5">
          {label}
        </p>
        <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white truncate group-hover:underline underline-offset-4">
          {value}
        </p>
      </div>
      <div className="ml-auto text-[#D4D4D4] dark:text-[#404040] group-hover:text-[#0A0A0A] dark:group-hover:text-white transition-colors duration-200 flex-shrink-0">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </div>
    </a>
  );
}

/* ────────────────────────────────────────────────────────
   Main Component
──────────────────────────────────────────────────────── */
export async function ContactInfo() {
  const siteConfig = await getSiteConfig();

  const whatsappHref = siteConfig.whatsappNumber
    ? `https://wa.me/${siteConfig.whatsappNumber.replace(/[^0-9]/g, "")}`
    : null;

  const phoneHref = siteConfig.contactPhone
    ? `tel:${siteConfig.contactPhone.replace(/[^0-9+]/g, "")}`
    : null;

  const mailHref = siteConfig.contactEmail
    ? `mailto:${siteConfig.contactEmail}`
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#737373] dark:text-neutral-500">
          Direct Channels
        </p>
        <h3 className="text-lg font-bold tracking-tight text-[#0A0A0A] dark:text-white">
          Talk to an engineer, not a&nbsp;sales rep.
        </h3>
        <p className="text-sm text-[#737373] dark:text-neutral-400 leading-relaxed">
          Every inquiry goes directly to a technical lead. Expect a real reply within 24 hours.
        </p>
      </div>

      {/* Channel Cards */}
      <div className="space-y-3">
        {phoneHref && siteConfig.contactPhone && (
          <ChannelCard
            icon={<PhoneIcon />}
            label="Call us"
            value={siteConfig.contactPhone}
            href={phoneHref}
          />
        )}
        {whatsappHref && siteConfig.whatsappNumber && (
          <ChannelCard
            icon={<WhatsAppIcon />}
            label="WhatsApp"
            value={`+91 ${siteConfig.whatsappNumber}`}
            href={whatsappHref}
            isExternal
          />
        )}
        {mailHref && siteConfig.contactEmail && (
          <ChannelCard
            icon={<MailIcon />}
            label="Email"
            value={siteConfig.contactEmail}
            href={mailHref}
          />
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-[#E5E5E5] dark:border-[#262626]" />

      {/* Info Pills */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-md bg-[#F5F5F5] dark:bg-[#1A1A1A] flex items-center justify-center text-[#737373] dark:text-neutral-400">
            <ClockIcon />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#0A0A0A] dark:text-white">Response within 24 hrs</p>
            <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5">
              Mon–Sat, 9 AM – 7 PM IST
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-md bg-[#F5F5F5] dark:bg-[#1A1A1A] flex items-center justify-center text-[#737373] dark:text-neutral-400">
            <ShieldIcon />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#0A0A0A] dark:text-white">Strict NDA guaranteed</p>
            <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5">
              Your project details stay confidential.
            </p>
          </div>
        </div>
      </div>

      {/* Urgent CTA */}
      <div className="p-4 rounded-lg bg-[#0A0A0A] dark:bg-white">
        <p className="text-xs font-bold text-white dark:text-[#0A0A0A] mb-1">
          Urgent launch deadline?
        </p>
        <p className="text-xs text-neutral-400 dark:text-neutral-600 leading-relaxed">
          Mention your go-live date in the message and we will prioritize an expedited technical review.
        </p>
      </div>
    </div>
  );
}
