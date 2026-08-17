import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

export function CTASection() {
  return (
    <section className="py-24 sm:py-32 bg-[#0A0A0A] text-white relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(#FFFFFF 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Brand Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/images/White_Logo.png"
            alt="ABCD Agency — AI-Powered Business Consulting & Digitalization"
            width={180}
            height={50}
            className="h-12 sm:h-14 w-auto object-contain"
          />
        </div>

        <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
          Ready to build something exceptional?
        </h2>

        <p className="mt-6 text-base sm:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Whether you need a full SaaS MVP, an enterprise portal, or dedicated sprint capacity, we are ready to engineer your vision.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            href="/contact"
            variant="white"
            size="lg"
            className="w-full sm:w-auto font-semibold px-8"
          >
            Book a Free Consultation
          </Button>
          <Button
            href="/pricing"
            variant="white-outline"
            size="lg"
            className="w-full sm:w-auto px-8"
          >
            Explore Engagement Models
          </Button>
        </div>

        <p className="mt-8 text-xs text-[#737373] tracking-wide">
          Direct founder consultation • Strict NDA included • No sales pressure
        </p>
      </div>
    </section>
  );
}
