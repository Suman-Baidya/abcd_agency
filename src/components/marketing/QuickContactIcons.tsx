import React from "react";
import { siteConfig } from "@/lib/siteConfig";

export function QuickContactIcons() {
  return (
    <div className="flex items-center gap-1">
      {/* Phone / Call */}
      <a
        href={siteConfig.contact.mobile}
        title="Call Us"
        aria-label="Call ABCD Agency"
        className="w-9 h-9 rounded-md flex items-center justify-center text-[#0A0A0A] dark:text-neutral-200 hover:bg-[#F5F5F5] dark:hover:bg-[#262626] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white"
      >
        <svg
          className="w-[18px] h-[18px] stroke-current"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      </a>

      {/* WhatsApp */}
      <a
        href={siteConfig.social.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        title="Chat on WhatsApp"
        aria-label="WhatsApp ABCD Agency"
        className="w-9 h-9 rounded-md flex items-center justify-center text-[#0A0A0A] dark:text-neutral-200 hover:bg-[#F5F5F5] dark:hover:bg-[#262626] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white"
      >
        <svg
          className="w-[18px] h-[18px] fill-current"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.98-.276-.1-.477-.15-.678.15-.2.3-.778.98-.954 1.18-.175.2-.351.226-.652.075-.3-.15-1.268-.468-2.416-1.492-.894-.798-1.497-1.784-1.673-2.085-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.2-.3.301-.501.1-.2.05-.376-.025-.526-.075-.15-.678-1.635-.93-2.24-.244-.588-.493-.508-.678-.518l-.577-.01c-.2 0-.527.075-.803.376s-1.054 1.03-1.054 2.511c0 1.482 1.079 2.912 1.23 3.113.15.2 2.124 3.243 5.145 4.549.718.311 1.28.497 1.718.636.723.23 1.38.198 1.9-.12.58-.354 1.782-.728 2.033-1.431.251-.703.251-1.305.176-1.431-.075-.126-.276-.201-.577-.351zM12 2C6.477 2 2 6.477 2 12c0 1.892.524 3.662 1.435 5.177L2 22l4.982-1.385C8.423 21.497 10.154 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.182c-1.628 0-3.136-.499-4.39-1.353l-.315-.213-2.955.821.802-2.881-.233-.37A8.156 8.156 0 0 1 3.818 12c0-4.512 3.67-8.182 8.182-8.182 4.512 0 8.182 3.67 8.182 8.182 0 4.512-3.67 8.182-8.182 8.182z" />
        </svg>
      </a>

      {/* Mail / Email */}
      <a
        href={`mailto:${siteConfig.contact.email}`}
        title="Email Us"
        aria-label="Email ABCD Agency"
        className="w-9 h-9 rounded-md flex items-center justify-center text-[#0A0A0A] dark:text-neutral-200 hover:bg-[#F5F5F5] dark:hover:bg-[#262626] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white"
      >
        <svg
          className="w-[18px] h-[18px] stroke-current"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      </a>
    </div>
  );
}
