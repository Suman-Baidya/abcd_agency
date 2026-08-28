import React from "react";
import { Hero } from "@/components/marketing/Hero";
import { Services } from "@/components/marketing/Services";
import { Process } from "@/components/marketing/Process";
import { WorkPreview } from "@/components/marketing/WorkPreview";
import { TechStack } from "@/components/marketing/TechStack";
import { Testimonials } from "@/components/marketing/Testimonials";
import { FAQSection } from "@/components/marketing/FAQSection";
import { CTASection } from "@/components/marketing/CTASection";
import { ContactSection } from "@/components/marketing/ContactSection";

export const metadata = {
  title: "ABCD Agency — Software Development & Digital Consulting",
  description:
    "Full-stack software engineering partner for ambitious brands. We build high-performance web apps, SaaS architectures, and automated business systems.",
};

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Services Section */}
      <Services />

      {/* 3. Execution Process */}
      <Process />

      {/* 4. Featured Work & Case Studies */}
      <WorkPreview />

      {/* 5. Production Tech Stack Band */}
      <TechStack />

      {/* 6. Testimonials */}
      <Testimonials />

      {/* 7. Smart FAQ Section */}
      <FAQSection />

      {/* 8. Final High-Impact CTA */}
      <CTASection />

      {/* 9. Contact Section */}
      <ContactSection />
    </div>
  );
}
