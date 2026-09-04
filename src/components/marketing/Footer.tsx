import React from "react";
import Link from "next/link";
import Image from "next/image";
import { NewsletterForm } from "./NewsletterForm";
import { getSiteConfig } from "@/lib/dbConfig";

import { InstallAppButton } from "@/components/ui/InstallAppButton";

export async function Footer() {
  const siteConfig = await getSiteConfig();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-[#0A0A0A] border-t border-[#E5E5E5] dark:border-[#262626] text-[#0A0A0A] dark:text-white pt-16 pb-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section: Brand + Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-[#E5E5E5] dark:border-[#262626]">
          <div className="lg:col-span-6 flex flex-col items-start">
            <Link
              href="/"
              className="inline-flex items-center mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white rounded-xs"
              aria-label="ABCD Agency Home"
            >
              {/* Light Mode Logo */}
              <Image
                src={siteConfig.lightLogoUrl || "/images/Black_Logo.png"}
                alt={`${siteConfig.agencyName} — AI-Powered Business Consulting & Digitalization`}
                width={180}
                height={50}
                className="h-10 w-auto object-contain block dark:hidden"
                style={{ width: "auto" }}
              />
              {/* Dark Mode Logo */}
              <Image
                src={siteConfig.darkLogoUrl || "/images/White_Logo.png"}
                alt={`${siteConfig.agencyName} — AI-Powered Business Consulting & Digitalization`}
                width={180}
                height={50}
                className="h-10 w-auto object-contain hidden dark:block"
                style={{ width: "auto" }}
              />
            </Link>
            <p className="text-sm text-[#737373] dark:text-[#A3A3A3] max-w-sm leading-relaxed mb-6">
              Engineering high-performance software, custom SaaS platforms, and intelligent business workflows for ambitious modern brands.
            </p>

            {/* Social Icons (Monochrome SVGs) */}
            <div className="flex items-center flex-wrap gap-4 mt-2">
              
              {/* Facebook */}
              {siteConfig.facebookUrl && (
                <a
                  href={siteConfig.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-md border border-[#E5E5E5] dark:border-[#262626] flex items-center justify-center text-[#0A0A0A] dark:text-neutral-200 hover:bg-[#F5F5F5] dark:hover:bg-[#262626] transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
                  </svg>
                </a>
              )}

              {/* Instagram */}
              {siteConfig.instagramUrl && (
                <a
                  href={siteConfig.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-md border border-[#E5E5E5] dark:border-[#262626] flex items-center justify-center text-[#0A0A0A] dark:text-neutral-200 hover:bg-[#F5F5F5] dark:hover:bg-[#262626] transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                  </svg>
                </a>
              )}

              {/* Behance */}
              {siteConfig.behanceUrl && (
                <a
                  href={siteConfig.behanceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Behance"
                  className="w-9 h-9 rounded-md border border-[#E5E5E5] dark:border-[#262626] flex items-center justify-center text-[#0A0A0A] dark:text-neutral-200 hover:bg-[#F5F5F5] dark:hover:bg-[#262626] transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-2.273-5.564-5.405 0-3.136 2.414-5.595 5.564-5.595 2.766 0 5.176 1.956 5.378 4.795h-6.728c.241 1.096 1.206 1.83 2.531 1.83 1.326 0 1.929-.623 2.152-1.353h3.768zm-5.06-4.63c-1.045 0-1.899.645-2.148 1.63h4.153c-.156-1.055-1.066-1.63-2.005-1.63zm-10.428-10.37h-8.238v20h8.775c3.344 0 5.485-1.644 5.485-4.475 0-1.745-1.127-3.238-2.616-3.834 1.139-.77 1.859-2.073 1.859-3.567 0-3.344-2.585-4.457-5.265-4.457h-3v-3.667zm-3.238 6.667h2.247c1.396 0 2.227.656 2.227 1.764 0 1.107-.831 1.764-2.227 1.764h-2.247v-3.528zm0 6.666h2.518c1.644 0 2.646.746 2.646 2.052 0 1.306-1.002 2.053-2.646 2.053h-2.518v-4.105z" />
                  </svg>
                </a>
              )}

              {/* YouTube */}
              {siteConfig.youtubeUrl && (
                <a
                  href={siteConfig.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-9 h-9 rounded-md border border-[#E5E5E5] dark:border-[#262626] flex items-center justify-center text-[#0A0A0A] dark:text-neutral-200 hover:bg-[#F5F5F5] dark:hover:bg-[#262626] transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              )}



              {/* LinkedIn */}
              {siteConfig.linkedinUrl && (
                <a
                  href={siteConfig.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-9 h-9 rounded-md border border-[#E5E5E5] dark:border-[#262626] flex items-center justify-center text-[#0A0A0A] dark:text-neutral-200 hover:bg-[#F5F5F5] dark:hover:bg-[#262626] transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              )}

              {/* X (Twitter) */}
              {siteConfig.twitterUrl && (
                <a
                  href={siteConfig.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter)"
                  className="w-9 h-9 rounded-md border border-[#E5E5E5] dark:border-[#262626] flex items-center justify-center text-[#0A0A0A] dark:text-neutral-200 hover:bg-[#F5F5F5] dark:hover:bg-[#262626] transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}

              {/* WhatsApp */}
              {siteConfig.whatsappNumber && (
                <a
                  href={`https://wa.me/${siteConfig.whatsappNumber.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="w-9 h-9 rounded-md border border-[#E5E5E5] dark:border-[#262626] flex items-center justify-center text-[#0A0A0A] dark:text-neutral-200 hover:bg-[#F5F5F5] dark:hover:bg-[#262626] transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 0C5.396 0 .029 5.367.029 11.987c0 2.108.549 4.168 1.595 5.972L0 24l6.235-1.587c1.734.945 3.684 1.442 5.796 1.442 6.636 0 12.003-5.367 12.003-11.987C24.034 5.367 18.667 0 12.031 0zm0 21.84c-1.802 0-3.568-.484-5.109-1.399l-.366-.217-3.797.967.985-3.699-.239-.379c-1.006-1.6-1.536-3.468-1.536-5.386 0-5.525 4.495-10.02 10.062-10.02 5.567 0 10.062 4.495 10.062 10.02 0 5.525-4.495 10.02-10.062 10.02zm5.513-7.514c-.302-.151-1.786-.882-2.063-.983-.277-.101-.478-.151-.68.151-.201.302-.781.983-.957 1.185-.176.201-.352.226-.654.075-.302-.151-1.275-.47-2.428-1.499-.898-.801-1.504-1.791-1.68-2.093-.176-.302-.019-.465.132-.616.136-.135.302-.352.453-.528.151-.176.201-.302.302-.503.101-.201.05-.377-.025-.528-.075-.151-.68-1.639-.931-2.244-.244-.59-.493-.51-.68-.52-.176-.009-.377-.009-.579-.009-.201 0-.528.075-.805.377-.277.302-1.057 1.033-1.057 2.519s1.082 2.922 1.233 3.123c.151.201 2.13 3.253 5.16 4.562.721.312 1.284.498 1.723.638.724.23 1.382.198 1.903.12.58-.087 1.786-.73 2.038-1.434.252-.704.252-1.308.176-1.434-.075-.126-.277-.201-.579-.352z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Newsletter Input */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <h4 className="text-sm font-bold text-[#0A0A0A] mb-2">
              Subscribe to Engineering &amp; Architecture Insights
            </h4>
            <p className="text-xs text-[#737373] mb-4">
              Bi-weekly engineering deep dives on Next.js, AI automation, and scalable systems.
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Middle Section: Navigation Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-[#E5E5E5] dark:border-[#262626]">
          {/* Col 1 */}
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#737373] dark:text-[#A3A3A3] mb-4">
              Services
            </p>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/services/web-development" className="text-[#0A0A0A] dark:text-[#E5E5E5] hover:underline">
                  Web &amp; SaaS Development
                </Link>
              </li>
              <li>
                <Link href="/services/consulting" className="text-[#0A0A0A] dark:text-[#E5E5E5] hover:underline">
                  Business Digitalization
                </Link>
              </li>
              <li>
                <Link href="/services/ui-ux" className="text-[#0A0A0A] dark:text-[#E5E5E5] hover:underline">
                  UI/UX &amp; Brand Systems
                </Link>
              </li>
              <li>
                <Link href="/services/ai-integration" className="text-[#0A0A0A] dark:text-[#E5E5E5] hover:underline">
                  AI Integration &amp; Pipelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2 */}
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#737373] dark:text-[#A3A3A3] mb-4">
              Company
            </p>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/about" className="text-[#0A0A0A] dark:text-[#E5E5E5] hover:underline">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/work" className="text-[#0A0A0A] dark:text-[#E5E5E5] hover:underline">
                  Case Studies
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-[#0A0A0A] dark:text-[#E5E5E5] hover:underline">
                  Engagement Models
                </Link>
              </li>
              <li>
                <Link href="/careers" className="inline-flex items-center gap-1.5 text-[#0A0A0A] dark:text-[#E5E5E5] hover:underline">
                  <span>Careers</span>
                  {!siteConfig.enableCareers ? (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#737373] dark:text-[#A3A3A3] tracking-tight">
                      {siteConfig.careersStatusText || "Closed"}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold tracking-tight">
                      Hiring
                    </span>
                  )}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#737373] dark:text-[#A3A3A3] mb-4">
              Resources
            </p>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/blog" className="text-[#0A0A0A] dark:text-[#E5E5E5] hover:underline">
                  Engineering Blog
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-[#0A0A0A] dark:text-[#E5E5E5] hover:underline">
                  Client Portal
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[#0A0A0A] dark:text-[#E5E5E5] hover:underline">
                  Book a Consultation
                </Link>
              </li>
              <li>
                <InstallAppButton label="Install Desktop / Mobile App" />
              </li>
              <li>
                <a href={`mailto:${siteConfig.contactEmail}`} className="text-[#0A0A0A] dark:text-[#E5E5E5] hover:underline">
                  Direct Email
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#737373] dark:text-[#A3A3A3] mb-4">
              Legal &amp; Security
            </p>
            <ul className="space-y-2.5 text-xs">
              {siteConfig.enablePrivacyPolicy !== false && (
                <li>
                  <Link href="/privacy" className="text-[#0A0A0A] dark:text-[#E5E5E5] hover:underline">
                    Privacy Policy
                  </Link>
                </li>
              )}
              {siteConfig.enableTermsOfService !== false && (
                <li>
                  <Link href="/terms" className="text-[#0A0A0A] dark:text-[#E5E5E5] hover:underline">
                    Terms of Service
                  </Link>
                </li>
              )}
              {siteConfig.enableRefundPolicy && (
                <li>
                  <Link href="/refund" className="text-[#0A0A0A] dark:text-[#E5E5E5] hover:underline">
                    Refund Policy
                  </Link>
                </li>
              )}
              {siteConfig.enableCookiePolicy && (
                <li>
                  <Link href="/cookies" className="text-[#0A0A0A] dark:text-[#E5E5E5] hover:underline">
                    Cookie Policy
                  </Link>
                </li>
              )}
              <li>
                <span className="text-[#737373] dark:text-[#A3A3A3]">
                  NDA Guarantee
                </span>
              </li>
              <li>
                <span className="text-[#737373] dark:text-[#A3A3A3]">
                  ISO Standards Aligned
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#737373] dark:text-[#A3A3A3]">
          <p>© {currentYear} ABCD Agency (abcdagency.com). All rights reserved.</p>
          <div className="flex items-center gap-6">
            {siteConfig.enablePrivacyPolicy !== false && (
              <Link href="/privacy" className="hover:text-[#0A0A0A] dark:hover:text-white transition-colors">
                Privacy
              </Link>
            )}
            {siteConfig.enableTermsOfService !== false && (
              <Link href="/terms" className="hover:text-[#0A0A0A] dark:hover:text-white transition-colors">
                Terms
              </Link>
            )}
            {siteConfig.enableRefundPolicy && (
              <Link href="/refund" className="hover:text-[#0A0A0A] dark:hover:text-white transition-colors">
                Refunds
              </Link>
            )}
            {siteConfig.enableCookiePolicy && (
              <Link href="/cookies" className="hover:text-[#0A0A0A] dark:hover:text-white transition-colors">
                Cookies
              </Link>
            )}
            <Link href="/contact" className="hover:text-[#0A0A0A] dark:hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
